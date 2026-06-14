import { REMOTE_SCRIPTS } from '@/utility/constant';
import type { Keyframe, Message, Script, ScriptSource } from '@/utility/type';
import { getCurrentTab, getVideoID, getVideoTime } from '@/utility/helper';

import { rgbToHex } from '@dl_sean/ado-light-show-common/src/color';
import { roundTime, sanitizeScript } from '@dl_sean/ado-light-show-common/src/script';
import {
	getCurrentKeyframeIndex,
	getCurrentRGB,
} from '@dl_sean/ado-light-show-common/src/light-engine';
import type { CommandEncoderWrapper } from '@dl_sean/ado-light-show-common/src/command-encoder-wrapper';

class LightEngine {
	private static readonly SCRIPTS_DEFAULT: Record<ScriptSource, Script> = Object.freeze({
		CUSTOM: { name: null, data: null },
		REMOTE: { name: null, data: null },
	});
	private scripts = structuredClone(LightEngine.SCRIPTS_DEFAULT);
	private scriptSource: ScriptSource = 'REMOTE';
	private loopID: number | null = null;
	private wrapper: CommandEncoderWrapper | null = null;

	constructor(wrapper: CommandEncoderWrapper) {
		this.destroy();
		this.wrapper = wrapper;
	}

	public start = (getTabID: () => number | null) => {
		if (this.loopID != null) return;

		this.loopID = setInterval(() => {
			const keyframes = this.scripts[this.scriptSource].data;
			if (keyframes == null) return;

			const tabID = getTabID();
			if (tabID == null) return;

			this.loop(keyframes, tabID);
		}, 16); // ~60Hz
	};

	public stop = () => {
		if (this.loopID == null) return;

		clearInterval(this.loopID);
		this.loopID = null;
	};

	private loop = async (keyframes: Keyframe[], tabID: number) => {
		const time = await getVideoTime(tabID);
		if (time == null) return;

		const currentKFIndex = getCurrentKeyframeIndex(keyframes, time);
		const currentKF = keyframes[currentKFIndex ?? -1] ?? null;
		if (!currentKF) return;

		const rgb = getCurrentRGB(currentKF, time);
		if (rgb == null) return;

		const hex = rgbToHex(rgb);
		const command = this.wrapper?.getColorCommand(hex);
		if (command == null) return;

		console.debug('Ado Light Show extension background - SEND_RGB_COMMAND', { command });
		chrome.tabs.sendMessage<Message>(tabID, { type: 'SEND_RGB_COMMAND', value: command });
	};

	public async destroy() {
		this.stop();
		this.scriptSource = 'REMOTE';
		this.loopID = null;

		const tab = await getCurrentTab();
		const videoID = tab?.id != null ? await getVideoID(tab.id) : null;
		const { source, script } = await this.setScript({ videoID });
		chrome.runtime.sendMessage<Message>({ type: 'SCRIPT_UPDATED', source, script });
	}

	public getScriptSource() {
		return this.scriptSource;
	}
	public getScript() {
		return this.scripts[this.scriptSource];
	}
	public setScriptSource(source: ScriptSource) {
		this.scriptSource = source;
	}
	public setScript = async (params: { videoID?: string | null; script?: Script }) => {
		const { videoID, script } = params;

		switch (this.scriptSource) {
			case 'CUSTOM':
				if (!script) break;

				this.scripts[this.scriptSource] = script;
				break;
			case 'REMOTE': {
				if (videoID == null) {
					this.scripts[this.scriptSource] = LightEngine.SCRIPTS_DEFAULT.REMOTE;
					break;
				}

				const remoteScript = await this.getRemoteScript(videoID);
				this.scripts[this.scriptSource] =
					remoteScript ?? LightEngine.SCRIPTS_DEFAULT.REMOTE;
				break;
			}
		}

		return { source: this.scriptSource, script: this.scripts[this.scriptSource] };
	};
	private getRemoteScript = async (videoID: string) => {
		const remoteScript = REMOTE_SCRIPTS[videoID];
		if (remoteScript == null) return null;

		const res = await fetch(remoteScript.url);
		if (!res.ok) return null;

		try {
			const parsed = await res.json();

			if (Array.isArray(parsed)) {
				const data = sanitizeScript(parsed).map((kf: Keyframe) => {
					// Convert pulse time from peak to start
					const time = kf.mode === 'pulse' ? roundTime(kf.time - kf.offsets[0]) : kf.time;
					return { ...kf, time };
				});
				console.debug('Loaded script:', data);

				return { name: remoteScript.name, data };
			}

			return null;
		} catch (error) {
			console.error(error);
			return null;
		}
	};
}

export default LightEngine;
