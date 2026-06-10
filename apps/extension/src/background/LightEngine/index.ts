import { REMOTE_SCRIPTS } from '@/utility/constant';
import type {
	Keyframe,
	Message,
	MessageResponse,
	Script,
	ScriptSource,
	Session,
} from '@/utility/type';

import { rgbToHex } from '@dl_sean/ado-light-show-common/src/color';
import { roundTime, sanitizeScript } from '@dl_sean/ado-light-show-common/src/script';
import {
	getCurrentKeyframeIndex,
	getCurrentRGB,
} from '@dl_sean/ado-light-show-common/src/light-engine';
import type { CommandEncoderWrapper } from '@dl_sean/ado-light-show-common/src/command-encoder-wrapper';
import { getVideoID } from '../helper';

class LightEngine {
	private static readonly SCRIPTS_DEFAULT: Record<ScriptSource, Script> = Object.freeze({
		CUSTOM: { name: null, data: null },
		REMOTE: { name: null, data: null },
	});
	private scripts = structuredClone(LightEngine.SCRIPTS_DEFAULT);
	private scriptSource: ScriptSource = 'CUSTOM';
	private loopID: number | null = null;
	private wrapper: CommandEncoderWrapper | null = null;

	constructor(wrapper: CommandEncoderWrapper) {
		this.wrapper = wrapper;
	}

	public start = (session: Session) => {
		if (this.loopID != null) return;

		this.loopID = setInterval(() => {
			const keyframes = this.scripts[this.scriptSource].data;
			if (session.status === 'DEACTIVATED' || keyframes == null) return;

			this.loop(keyframes, session.tabID);
		}, 16); // ~60Hz
	};

	public stop = () => {
		if (this.loopID == null) return;

		clearInterval(this.loopID);
		this.loopID = null;
	};

	private loop = async (keyframes: Keyframe[], tabID: number) => {
		const { value: time } = await new Promise<MessageResponse<'GET_VIDEO_TIME'>>((resolve) => {
			chrome.tabs.sendMessage<Message, MessageResponse<'GET_VIDEO_TIME'>>(
				tabID,
				{ type: 'GET_VIDEO_TIME' },
				(response) => resolve(response),
			);
		});

		const currentKFIndex = getCurrentKeyframeIndex(keyframes, time);
		const currentKF = keyframes[currentKFIndex ?? -1] ?? null;
		if (!currentKF) return;

		const rgb = getCurrentRGB(currentKF, time);
		if (rgb == null) return;

		const hex = rgbToHex(rgb);
		const command = this.wrapper?.getColorCommand(hex);
		if (command == null) return;

		chrome.tabs.sendMessage<Message>(tabID, { type: 'SEND_RGB_COMMAND', value: command });
	};

	public destroy() {
		this.stop();
		this.scripts = structuredClone(LightEngine.SCRIPTS_DEFAULT);
		this.scriptSource = 'CUSTOM';
		this.loopID = null;
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
	public setScript = async (session: Session, script?: Script) => {
		switch (this.scriptSource) {
			case 'CUSTOM':
				if (script) this.scripts[this.scriptSource] = script;
				break;
			case 'REMOTE': {
				const videoID = await getVideoID(session);
				if (videoID == null) break;

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
