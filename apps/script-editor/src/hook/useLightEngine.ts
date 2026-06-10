'use client';

import { RefObject, useCallback, useRef, useState } from 'react';
import type { EditableKeyframe, RGB } from '@/type';
import {
	getCurrentKeyframeIndex,
	getCurrentRGB,
} from '@dl_sean/ado-light-show-common/src/light-engine';

interface Props {
	scriptRef: RefObject<EditableKeyframe[]>;
	getCurrentTime: () => number;
}
const useLightEngine = ({ scriptRef, getCurrentTime }: Props) => {
	const [currentKeyframe, setCurrentKeyframe] = useState<EditableKeyframe | null>(null);
	const [currentKeyframeIndex, setCurrentKeyframeIndex] = useState<number | null>(null);
	const [currentRGB, setCurrentRGB] = useState<RGB | null>(null);
	const [currentTime, setCurrentTime] = useState<number | null>(null);
	const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Put wasm in public folder and load with await fetch('/light_engine.wasm')
	const loop = useCallback(async () => {
		const script = scriptRef.current;

		const time = getCurrentTime();
		setCurrentTime(time);
		const currentKFIndex = getCurrentKeyframeIndex(script, time);
		const currentKF = script[currentKFIndex ?? -1] ?? null;
		setCurrentKeyframe(currentKF);
		setCurrentKeyframeIndex(currentKFIndex);

		if (!currentKF) {
			setCurrentRGB(null);
			return;
		}

		const rgb = getCurrentRGB(currentKF, time);
		setCurrentRGB(rgb);
	}, [getCurrentTime, scriptRef]);

	const start = useCallback(() => {
		if (loopRef.current != null) return;

		loopRef.current = setInterval(() => {
			loop();
		}, 16);
	}, [loop]);

	const stop = useCallback(() => {
		if (loopRef.current == null) return;

		clearInterval(loopRef.current);
		loopRef.current = null;
	}, []);

	return {
		currentKeyframe,
		currentKeyframeIndex,
		currentRGB,
		currentTime,
		start,
		stop,
	};
};

export default useLightEngine;
