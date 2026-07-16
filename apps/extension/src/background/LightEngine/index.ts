import { getVideoId, getCurrentTab, getVideoTime } from '@/background/helper';
import { REMOTE_SCRIPT_BASE_URL } from '@/utility/constant';
import type { Keyframe, Message, Script, ScriptSource } from '@/utility/type';

import { rgbToHex } from '@dl_sean/ado-light-show-common/src/color';
import { roundTime, sanitizeScript } from '@dl_sean/ado-light-show-common/src/script';
import {
	getCurrentKeyframeIndex,
	getCurrentRGB,
} from '@dl_sean/ado-light-show-common/src/light-engine';
import type { CommandEncoderWrapper } from '@dl_sean/ado-light-show-common/src/command-encoder-wrapper';

class LightEngine {
	private scriptIndexCache: Record<string, { name: string; file: string }> | null = null;

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

	public start = ({
		videoTabId,
		deviceTabId,
	}: {
		videoTabId: number | null;
		deviceTabId: number | null;
	}) => {
		if (
			this.scripts[this.scriptSource].data == null ||
			this.loopID != null ||
			videoTabId == null ||
			deviceTabId == null
		)
			return;

		this.loopID = setInterval(() => {
			this.loop(videoTabId, deviceTabId);
		}, 16);
	};

	public stop = () => {
		if (this.loopID == null) return;

		clearInterval(this.loopID);
		this.loopID = null;
	};

	private loop = async (videoTabId: number, deviceTabId: number) => {
		const keyframes = this.scripts[this.scriptSource].data;
		const time = await getVideoTime(videoTabId);
		if (keyframes == null || time == null) return;

		const currentKFIndex = getCurrentKeyframeIndex(keyframes, time);
		const currentKF = keyframes[currentKFIndex ?? -1] ?? null;
		if (!currentKF) return;

		const rgb = getCurrentRGB(currentKF, time);
		if (rgb == null) return;

		const hex = rgbToHex(rgb);
		const command = this.wrapper?.getColorCommand(hex);
		if (command == null) return;

		console.debug('Ado Light Show extension background - SEND_RGB_COMMAND', { command });
		chrome.tabs.sendMessage<Message>(deviceTabId, { type: 'SEND_RGB_COMMAND', value: command });
	};

	public async destroy() {
		this.stop();
		this.scriptSource = 'REMOTE';
		this.loopID = null;
		this.syncScript();
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
	public setScript = async (params: { videoId?: string | null; script?: Script }) => {
		const { videoId, script } = params;

		switch (this.scriptSource) {
			case 'CUSTOM':
				if (!script) break;

				this.scripts[this.scriptSource] = script;
				break;
			case 'REMOTE': {
				if (videoId == null) {
					this.scripts[this.scriptSource] = LightEngine.SCRIPTS_DEFAULT.REMOTE;
					break;
				}

				const remoteScript = await this.getRemoteScript(videoId);
				this.scripts[this.scriptSource] =
					remoteScript ?? LightEngine.SCRIPTS_DEFAULT.REMOTE;
				break;
			}
		}

		return { source: this.scriptSource, script: this.scripts[this.scriptSource] };
	};
	public async syncScript() {
		const currentTabId = (await getCurrentTab())?.id ?? null;
		const videoId = currentTabId != null ? await getVideoId(currentTabId) : null;
		const { source, script } = await this.setScript({ videoId });

		chrome.runtime.sendMessage<Message>({ type: 'SCRIPT_UPDATED', source, name: script.name });
	}
	private async loadScriptIndex() {
		if (this.scriptIndexCache) return this.scriptIndexCache;

		try {
			const res = await fetch(`${REMOTE_SCRIPT_BASE_URL}/index.json`);
			if (!res.ok) throw new Error(`${res.status} - ${res.url}`);

			this.scriptIndexCache = await res.json();
			return this.scriptIndexCache;
		} catch (error) {
			console.error(error);
			return null;
		}
	}
	private getRemoteScript = async (videoID: string) => {
		try {
			const scriptIndex = await this.loadScriptIndex();
			if (!scriptIndex?.[videoID]) throw new Error(`${videoID} not found in script index`);

			const res = await fetch(`${REMOTE_SCRIPT_BASE_URL}/${scriptIndex[videoID].file}`);
			if (!res.ok) throw new Error(`${res.status} - ${res.url}`);

			const parsed = await res.json();

			if (Array.isArray(parsed)) {
				const data = sanitizeScript(parsed).map((kf: Keyframe) => {
					// Convert pulse time from peak to start
					const time = kf.mode === 'pulse' ? roundTime(kf.time - kf.offsets[0]) : kf.time;
					return { ...kf, time };
				});
				console.debug('Loaded script:', data);

				return { name: scriptIndex[videoID].name, data };
			}

			return null;
		} catch (error) {
			console.error(error);
			return null;
		}
	};
}

export default LightEngine;
