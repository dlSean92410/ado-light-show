'use client';

import { useCallback, useRef } from 'react';
import type { Keyframe, EditableKeyframe } from '@/type';
import {
	roundTime,
	sanitizeKeyframe,
	sanitizeScript,
} from '@dl_sean/ado-light-show-common/src/script';
import { DEFAULT_PULSE_KEYFRAME } from '@/utility/constant';

const useScript = () => {
	const scriptRef = useRef<EditableKeyframe[]>([]);

	const handleLoadCustomScript = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const parsed = JSON.parse(event.target?.result as string);
				if (Array.isArray(parsed)) {
					const data = sanitizeScript(parsed).map((kf: Keyframe): EditableKeyframe => {
						// Convert pulse time from peak to start
						const time =
							kf.mode === 'pulse' ? roundTime(kf.time - kf.offsets[0]) : kf.time;
						return { ...kf, time, id: crypto.randomUUID() };
					});

					console.debug('Loaded script:', data);
					scriptRef.current = data;
				}
			} catch (err) {
				console.error('Invalid script file', err);
			}
		};
		reader.readAsText(file);

		e.target.value = ''; // reset input
	}, []);

	const handleSaveScript = useCallback(async () => {
		const json = JSON.stringify(
			sanitizeScript(
				scriptRef.current.map(({ id, ...kf }) => {
					// Convert pulse time from start to peak
					const time = kf.mode === 'pulse' ? roundTime(kf.time + kf.offsets[0]) : kf.time;
					return { ...kf, time };
				}),
			),
			null,
			2,
		);
		await navigator.clipboard.writeText(json);
		console.log('Copied to clipboard:', json);
	}, []);

	const handleResetScript = useCallback(() => {
		scriptRef.current = [];
	}, []);

	const handleAddKeyframe = useCallback((time: number) => {
		const script = scriptRef.current;
		const startTime = roundTime(time - DEFAULT_PULSE_KEYFRAME.offsets[0]);

		let insertIndex = 0;
		for (let i = 0; i < script.length; i++) {
			if (script[i].time > startTime) {
				insertIndex = i;
				break;
			}
			insertIndex = i + 1;
		}

		const newKF: EditableKeyframe = {
			...DEFAULT_PULSE_KEYFRAME,
			time: startTime,
			id: crypto.randomUUID(),
		};

		const newScript = [...script.slice(0, insertIndex), newKF, ...script.slice(insertIndex)];

		const prev = newScript[insertIndex - 1] ?? null;
		const next = newScript[insertIndex + 1] ?? null;

		const affected = new Set([newKF.id, prev?.id, next?.id]);
		const sanitizedScript = newScript.map((kf, i) => {
			if (!affected.has(kf.id)) return kf;

			const prev = newScript[i - 1] ?? null;
			const next = newScript[i + 1] ?? null;
			const sanitizedKF = sanitizeKeyframe(kf, prev, next);
			return { ...sanitizedKF, id: kf.id };
		});

		scriptRef.current = sanitizedScript;

		console.log('@@@add', sanitizedScript);
	}, []);

	const handleRemoveKeyframe = useCallback((id: string) => {
		const script = scriptRef.current;

		const index = script.findIndex((k) => k.id === id);
		if (index === -1) return;

		const oldPrev = script[index - 1] ?? null;
		const oldNext = script[index + 1] ?? null;

		const newScript = script.filter((k) => k.id !== id);

		const sanitizedScript = newScript.map((kf, i) => {
			if (kf.id !== oldPrev?.id && kf.id !== oldNext?.id) return kf;

			const prev = newScript[i - 1] ?? null;
			const next = newScript[i + 1] ?? null;
			const sanitizedKF = sanitizeKeyframe(kf, prev, next);
			return { ...sanitizedKF, id: kf.id };
		});

		scriptRef.current = sanitizedScript;

		console.log('@@@remove', sanitizedScript);
	}, []);

	const handleUpdateKeyframe = useCallback((newKF: EditableKeyframe) => {
		const script = scriptRef.current;

		const oldIndex = script.findIndex((k) => k.id === newKF.id);
		const oldPrev = script[oldIndex - 1] ?? null;
		const oldNext = script[oldIndex + 1] ?? null;

		const withoutKF = script.filter((k) => k.id !== newKF.id);
		const newKFIndex = withoutKF.findIndex((x) => x.time > newKF.time);
		const newScript =
			newKFIndex === -1
				? [...withoutKF, newKF]
				: [...withoutKF.slice(0, newKFIndex), newKF, ...withoutKF.slice(newKFIndex)];

		const newIndex = newScript.findIndex((k) => k.id === newKF.id);
		const newPrev = newScript[newIndex - 1] ?? null;
		const newNext = newScript[newIndex + 1] ?? null;

		const affected = new Set([newKF.id, oldPrev?.id, oldNext?.id, newPrev?.id, newNext?.id]);
		const sanitizedScript = newScript.map((kf, i) => {
			if (!affected.has(kf.id)) return kf;

			const prev = newScript[i - 1] ?? null;
			const next = newScript[i + 1] ?? null;
			const sanitizedKF = sanitizeKeyframe(kf, prev, next);
			return { ...sanitizedKF, id: kf.id };
		});

		scriptRef.current = sanitizedScript;

		console.log('@@@update', sanitizedScript);
	}, []);

	return {
		scriptRef,
		handleLoadCustomScript,
		handleSaveScript,
		handleResetScript,
		handleAddKeyframe,
		handleRemoveKeyframe,
		handleUpdateKeyframe,
	};
};

export default useScript;
