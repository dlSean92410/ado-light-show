import type { RGB, Keyframe } from './type';
import { hexToRgb, lerpRgb } from './color';

const getCurrentKeyframeIndex = (kfs: Keyframe[], time: number): number | null => {
	let currentKFIndex: number | null = null;
	for (let index = 0; index < kfs.length; index++) {
		const kf = kfs[index];
		if (kf.time > time) break;
		currentKFIndex = index; // keep updating until we pass time and break out
	}

	return currentKFIndex;
};

const getCurrentRGB = (kf: Keyframe, time: number): RGB | null => {
	let rgb: RGB | null = null;
	switch (kf.mode) {
		case 'on': {
			const { color } = kf;
			rgb = hexToRgb(color);
			break;
		}
		case 'pulse': {
			const { colors, time: startTime, offsets } = kf; // startTime is updated during load
			const [startHex, peakHex, endHex] = colors;

			const peakTime = startTime + offsets[0];
			const endTime = peakTime + offsets[1];
			if (time < peakTime) {
				// Fade-in: start → peak
				const progress = (time - startTime) / offsets[0];
				const clampedProgress = Math.min(1, Math.max(0, progress));
				const fromRgb = hexToRgb(startHex);
				const toRgb = hexToRgb(peakHex);
				rgb = lerpRgb(fromRgb, toRgb, clampedProgress);
			} else if (time < endTime) {
				// Fade-out: peak → end
				const progress = (time - peakTime) / offsets[1];
				const clampedProgress = Math.min(1, Math.max(0, progress));
				const fromRgb = hexToRgb(peakHex);
				const toRgb = hexToRgb(endHex);
				rgb = lerpRgb(fromRgb, toRgb, clampedProgress);
			} else {
				// After pulse window → stay at end color
				rgb = hexToRgb(endHex);
			}
			break;
		}
		case 'fade': {
			const { colors, time: startTime, offset } = kf;

			const fromRgb = hexToRgb(colors[0]);
			const toRgb = hexToRgb(colors[1]);

			const progress = (time - startTime) / offset;
			const clampedProgress = Math.min(1, Math.max(0, progress));
			rgb = lerpRgb(fromRgb, toRgb, clampedProgress);
			break;
		}
		case 'loop': {
			const { colors, time: startTime, offsets } = kf;
			if (colors.length === 0 || offsets.length === 0) {
				rgb = { r: 0, g: 0, b: 0 };
				break;
			}

			const elapsed = time - startTime;
			const segmentCount = colors.length;

			const cumulativeOffsets = offsets.reduce(
				(acc, cur) => [...acc, (acc.at(-1) ?? 0) + cur],
				[] as number[],
			);
			const totalLoop = cumulativeOffsets.at(-1) ?? 0;
			const loopPos = elapsed % totalLoop; // Position within the loop

			const segmentIndex = cumulativeOffsets.findIndex((c) => loopPos < c);
			const segmentStartTime = (cumulativeOffsets.at(segmentIndex - 1) ?? 0) % totalLoop;
			const segmentOffset = offsets[segmentIndex];
			const segmentProgress = (loopPos - segmentStartTime) / segmentOffset;
			const clampedSegmentProgress = Math.min(1, Math.max(0, segmentProgress));

			// Colors for this segment
			const fromHex = colors[segmentIndex];
			const toHex = colors[(segmentIndex + 1) % segmentCount];
			const fromRgb = hexToRgb(fromHex);
			const toRgb = hexToRgb(toHex);
			rgb = lerpRgb(fromRgb, toRgb, clampedSegmentProgress);
			break;
		}
		default: {
			console.error('Unknown KeyFrame', kf);
			break;
		}
	}

	return rgb;
};

export { getCurrentKeyframeIndex, getCurrentRGB };
