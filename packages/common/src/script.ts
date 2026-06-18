import type { Keyframe, OnKeyframe, FadeKeyframe, PulseKeyframe, LoopKeyframe } from './type';

const clampOffset = (x: number) => Math.max(0, Number(x.toFixed(2)));
const roundTime = (x: number) => Number(x.toFixed(4));

const sanitizeOnKeyframe = <T extends OnKeyframe>(kf: T): T => {
	return { ...kf, time: roundTime(kf.time) };
};

const sanitizeFadeKeyframe = <T extends FadeKeyframe>(
	kf: T,
	prev: Keyframe | null,
	next: Keyframe | null,
	{ clampColors }: { clampColors: boolean },
): T => {
	const newKF = { ...kf };

	// Optional color sync
	if (clampColors) {
		if (prev)
			newKF.colors[0] =
				prev.mode === 'on' ? prev.color : (prev.colors?.at(-1) ?? newKF.colors[0]);
		if (next)
			newKF.colors[1] =
				next.mode === 'on' ? next.color : (next.colors?.[0] ?? newKF.colors[1]);
	}

	if (next) {
		newKF.offset = clampOffset(newKF.offset);
	}

	newKF.time = roundTime(newKF.time);
	return newKF;
};

const sanitizePulseKeyframe = <T extends PulseKeyframe>(
	kf: T,
	prev: Keyframe | null,
	next: Keyframe | null,
	{ clampColors }: { clampColors: boolean },
): T => {
	const newKF = { ...kf };
	let [inOffset, outOffset] = newKF.offsets;

	// Optional color sync
	if (clampColors) {
		if (prev)
			newKF.colors[0] =
				prev.mode === 'on' ? prev.color : (prev.colors?.at(-1) ?? newKF.colors[0]);
		if (next)
			newKF.colors[2] =
				next.mode === 'on' ? next.color : (next.colors?.[0] ?? newKF.colors[2]);
	}

	// Offsets must be >= 0
	inOffset = clampOffset(inOffset);
	outOffset = clampOffset(outOffset);

	// Offset clamp
	if (next) {
		const end = newKF.time + outOffset;
		const overflow = end - next.time - (next.mode === 'pulse' ? next.offsets[0] : 0);
		const outInRatio = outOffset / inOffset;

		if (overflow > 0) {
			// const shrink = overflow / 2;
			const shrink = overflow / (outInRatio + 1);
			inOffset = clampOffset(inOffset - shrink);
			outOffset = clampOffset(outOffset - outInRatio * shrink);
		}
	}

	newKF.offsets = [inOffset, outOffset];
	newKF.time = roundTime(newKF.time);
	return newKF;
};

const sanitizeLoopKeyframe = <T extends LoopKeyframe>(
	kf: T,
	prev: Keyframe | null,
	next: Keyframe | null,
	{ clampColors }: { clampColors: boolean },
): T => {
	const newKF = { ...kf };

	// Optional color sync
	if (clampColors) {
		if (prev)
			newKF.colors[0] =
				prev.mode === 'on' ? prev.color : (prev.colors?.at(-1) ?? newKF.colors[0]);
		if (next)
			newKF.colors[newKF.colors.length - 1] =
				next.mode === 'on' ? next.color : (next.colors?.[0] ?? newKF.colors.at(-1));
	}

	// Offsets >= 0
	newKF.offsets = newKF.offsets.map(clampOffset) as LoopKeyframe['offsets'];

	// Ensure colors.length === offsets.length
	const n = Math.min(newKF.colors.length, newKF.offsets.length);
	newKF.colors = newKF.colors.slice(0, n) as LoopKeyframe['colors'];
	newKF.offsets = newKF.offsets.slice(0, n) as LoopKeyframe['offsets'];

	// Offset clamp
	if (next) {
		const end = newKF.time + newKF.offsets.reduce((a, b) => a + b, 0);
		const overflow = end - next.time;

		if (overflow > 0) {
			const shrink = overflow / newKF.offsets.length;
			newKF.offsets = newKF.offsets.map((o) =>
				clampOffset(o - shrink),
			) as LoopKeyframe['offsets'];
		}
	}

	newKF.time = roundTime(newKF.time);
	return newKF;
};

const sanitizeKeyframe = (
	kf: Keyframe,
	prev: Keyframe | null = null,
	next: Keyframe | null = null,
	options: { clampColors?: boolean; clampOffsets?: boolean } = {},
): Keyframe => {
	const { clampColors = false, clampOffsets = true } = options;

	switch (kf.mode) {
		case 'on':
			return sanitizeOnKeyframe(kf);
		case 'fade':
			return sanitizeFadeKeyframe(kf, prev, next, { clampColors });
		case 'pulse':
			return sanitizePulseKeyframe(kf, prev, next, { clampColors });
		case 'loop':
			return sanitizeLoopKeyframe(kf, prev, next, { clampColors });
		default:
			return kf;
	}
};

const sanitizeScript = (script: Keyframe[]) => {
	const sorted = [...script].sort((a, b) => a.time - b.time);

	return sorted.map((kf, i) => {
		const prev = sorted[i - 1] ?? null;
		const next = sorted[i + 1] ?? null;
		return sanitizeKeyframe(kf, prev, next);
	});
};

export { roundTime, sanitizeKeyframe, sanitizeScript };
