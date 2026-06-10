// #region Currenctly unused. Move light engine logic here if possible.
import {
	BaseKeyframe,
	FadeKeyframe,
	KeyframeMode,
	LoopKeyframe,
	OnKeyframe,
	PulseKeyframe,
	RGB,
} from './type';
import { hexToRgb, lerpRgb } from './color';

export function getCurrentKeyframeIndex(kfTimes: Array<f32>, time: f32): i32 {
	let index: i32 = -1;

	for (let i = 0; i < kfTimes.length; i++) {
		const kfTime = kfTimes[i];
		if (kfTime > time) break;
		index = i;
	}

	return index;
}

function clamp(x: f32): f32 {
	return x < 0 ? 0 : x > 1 ? 1 : x;
}
export function getCurrentRGB(kf: BaseKeyframe, time: f32): RGB | null {
	switch (kf.mode) {
		case KeyframeMode.On: {
			const onKF = changetype<OnKeyframe>(kf);
			return hexToRgb(onKF.color);
		}
		case KeyframeMode.Pulse: {
			const pulseKF = changetype<PulseKeyframe>(kf);
			const startTime = pulseKF.time;
			const startHex = pulseKF.colors[0];
			const peakHex = pulseKF.colors[1];
			const endHex = pulseKF.colors[2];

			const rise = pulseKF.offsets[0];
			const fall = pulseKF.offsets[1];
			const peakTime = startTime + rise;
			const endTime = peakTime + fall;

			if (time < peakTime) {
				// Fade-in: start → peak
				const progress = (time - startTime) / rise;
				return lerpRgb(hexToRgb(startHex), hexToRgb(peakHex), clamp(progress));
			} else if (time < endTime) {
				// Fade-out: peak → end
				const progress = (time - peakTime) / fall;
				return lerpRgb(hexToRgb(peakHex), hexToRgb(endHex), clamp(progress));
			} else {
				// After pulse window → stay at end color
				return hexToRgb(endHex);
			}
		}
		case KeyframeMode.Fade: {
			const fadeKF = changetype<FadeKeyframe>(kf);
			const startTime = fadeKF.time;
			const fromHex = fadeKF.colors[0];
			const toHex = fadeKF.colors[1];
			const offset = fadeKF.offset;

			const progress = (time - startTime) / offset;
			return lerpRgb(hexToRgb(fromHex), hexToRgb(toHex), clamp(progress));
		}
		case KeyframeMode.Loop: {
			const loopKF = changetype<LoopKeyframe>(kf);
			const colors = loopKF.colors;
			const offsets = loopKF.offsets;

			const segmentCount = colors.length;
			if (segmentCount == 0 || offsets.length == 0) {
				return new RGB(0, 0, 0);
			}

			const elapsed = time - kf.time;

			// Build cumulative offsets
			const cumulativeOffsets = new Array<f32>(offsets.length);
			let sum: f32 = 0;
			for (let i = 0; i < offsets.length; i++) {
				sum += offsets[i];
				cumulativeOffsets[i] = sum;
			}
			const totalLoop = cumulativeOffsets[cumulativeOffsets.length - 1];
			const loopPos = elapsed % totalLoop; // Position within the loop

			// Find segment index
			let segmentIndex = 0;
			for (; segmentIndex < cumulativeOffsets.length; segmentIndex++) {
				if (loopPos < cumulativeOffsets[segmentIndex]) break;
			}

			const segStart: f32 = segmentIndex == 0 ? 0 : cumulativeOffsets[segmentIndex - 1];
			const segOffset = offsets[segmentIndex];
			const segmentProgress = (loopPos - segStart) / segOffset;

			const fromHex = colors[segmentIndex];
			const toHex = colors[(segmentIndex + 1) % segmentCount];

			return lerpRgb(hexToRgb(fromHex), hexToRgb(toHex), clamp(segmentProgress));
		}
	}

	return null;
}
// #endregion
