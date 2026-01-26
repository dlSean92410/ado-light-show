import { REMOTE_SCRIPTS } from '@/utility/constant';
import { hexToRgb, lerpRgb } from '@/utility/helper';
import type { Keyframe, Message, Script, ScriptSource, Session } from '@/utility/type';

class LightEngine {
	private static readonly SCRIPTS_DEFAULT: { [key in ScriptSource]: Script } = {
		CUSTOM: { name: null, data: null },
		REMOTE: { name: null, data: null },
	};
	private scripts = LightEngine.SCRIPTS_DEFAULT;
	private scriptSource: ScriptSource = 'CUSTOM';
	private loopID: number | null = null;

	constructor() {}

	public start = (session: Session) => {
		if (this.loopID != null) return;

		this.loopID = setInterval(() => {
			const keyframes = this.scripts[this.scriptSource].data;
			if (session.status === 'DEACTIVATED' || keyframes == null) return;

			this.loop(keyframes, session.tabID);
		}, 16); // ~60Hz
	};

	public stop = () => {
		if (this.loopID != null) {
			clearInterval(this.loopID);
			this.loopID = null;
		}
	};

	private loop = async (keyframes: Keyframe[], tabID: number) => {
		const time = await new Promise<number>((resolve) => {
			chrome.tabs.sendMessage<Message, number>(
				tabID,
				{ type: 'GET_VIDEO_TIME' },
				(response) => {
					resolve(response);
				},
			);
		});
		let currentKF: Keyframe | null = null;
		for (const keyframe of keyframes) {
			if (keyframe.time > time) break;
			currentKF = keyframe; // keep updating until we pass time and break out
		}
		if (!currentKF) return;

		console.debug(
			'Ado Light Show extension Light Engine loop',
			time,
			currentKF.time,
			currentKF.mode,
		);

		switch (currentKF.mode) {
			case 'on': {
				const { color } = currentKF;
				const rgb = hexToRgb(color);

				await new Promise(() => {
					chrome.tabs.sendMessage<Message>(tabID, {
						type: 'SEND_RGB_COMMAND',
						value: rgb,
					});
				});
				break;
			}
			case 'pulse': {
				const { colors, time: startTime, offsets } = currentKF; // startTime is updated during load
				const [startHex, peakHex, endHex] = colors;

				const peakTime = startTime + offsets[0];
				const endTime = peakTime + offsets[1];
				let rgb;
				if (time < startTime) {
					// Before pulse window → stay at start color
					rgb = hexToRgb(startHex);
				} else if (time < peakTime) {
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

				await new Promise(() => {
					chrome.tabs.sendMessage<Message>(tabID, {
						type: 'SEND_RGB_COMMAND',
						value: rgb,
					});
				});
				break;
			}
			case 'fade': {
				const { colors, time: startTime, offset } = currentKF;

				const fromRgb = hexToRgb(colors[0]);
				const toRgb = hexToRgb(colors[1]);

				const progress = (time - startTime) / offset;
				const clampedProgress = Math.min(1, Math.max(0, progress));
				const fadedRgb = lerpRgb(fromRgb, toRgb, clampedProgress);

				await new Promise(() => {
					chrome.tabs.sendMessage<Message>(tabID, {
						type: 'SEND_RGB_COMMAND',
						value: fadedRgb,
					});
				});
				break;
			}
			case 'loop': {
				const { colors, time: startTime, offsets } = currentKF;

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
				const fadedRgb = lerpRgb(fromRgb, toRgb, clampedSegmentProgress);

				await new Promise(() => {
					chrome.tabs.sendMessage<Message>(tabID, {
						type: 'SEND_RGB_COMMAND',
						value: fadedRgb,
					});
				});
				break;
			}
			default: {
				console.error('Unknown KeyFrame', currentKF);
				break;
			}
		}
	};

	public destroy() {
		this.stop();
		this.scripts = LightEngine.SCRIPTS_DEFAULT;
		this.scriptSource = 'CUSTOM';
		this.loopID = null;
	}

	public getScriptSource() {
		return this.scriptSource;
	}
	public getScript() {
		return this.scripts[this.scriptSource];
	}
	public setScript = async (session: Session, source: ScriptSource, script?: Script) => {
		this.scriptSource = source;

		switch (source) {
			case 'CUSTOM':
				if (script) this.scripts[source] = script;
				break;
			case 'REMOTE': {
				const remoteScript = await this.getRemoteScript(session);
				if (remoteScript) this.scripts[source] = remoteScript;
				break;
			}
		}
	};
	private getRemoteScript = async (session: Session) => {
		if (session.status === 'DEACTIVATED') return null;

		const remoteScript = REMOTE_SCRIPTS[session.videoID];
		if (remoteScript == null) return null;

		const res = await fetch(remoteScript.url);
		if (!res.ok) return null;

		try {
			const data = await res.json();
			return {
				name: remoteScript.name,
				data: data.map(
					(kf: Keyframe): Keyframe => ({
						...kf,
						time:
							kf.mode === 'pulse'
								? Number((kf.time - kf.offsets[0]).toFixed(4))
								: Number(kf.time.toFixed(4)),
					}),
				),
			};
		} catch (error) {
			console.error(error);
			return null;
		}
	};
}

export default LightEngine;
