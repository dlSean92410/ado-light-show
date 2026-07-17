import type { Keyframe, RGB } from '@dl_sean/ado-light-show-common/src/type';

type Message =
	// Script
	| { type: 'GET_SCRIPT' }
	| { type: 'SET_SCRIPT'; source: ScriptSource; script?: Script }
	| ({ type: 'SCRIPT_UPDATED' } & MessageResponse<'GET_SCRIPT'>)
	// Video
	| { type: 'GET_VIDEO_TITLE' }
	| { type: 'GET_VIDEO_TIME' }
	| { type: 'GET_VIDEO_AVERAGE_RGB' }
	// Command
	| { type: 'SEND_RGB_COMMAND'; value: string }
	// Background Script
	| { type: 'SET_LIGHT_ENGINE_STATE'; value: boolean }
	// Device Tab
	| { type: 'GET_DEVICE_TAB' }
	| { type: 'FOCUS_DEVICE_TAB' }
	| { type: 'SET_DEVICE_COUNT'; value: number }
	| ({ type: 'DEVICE_TAB_UPDATED' } & MessageResponse<'GET_DEVICE_TAB'>)
	// Video Tab
	| { type: 'GET_VIDEO_TAB' }
	| { type: 'FOCUS_VIDEO_TAB' }
	| { type: 'SET_VIDEO_TAB_STATE'; value: boolean }
	| ({ type: 'VIDEO_TAB_UPDATED' } & MessageResponse<'GET_VIDEO_TAB'>);
type Response =
	// Script
	| { type: 'GET_SCRIPT'; source: ScriptSource; name: Script['name'] }
	// Video
	| { type: 'GET_VIDEO_TITLE'; value: string | null }
	| { type: 'GET_VIDEO_TIME'; value: number }
	| { type: 'GET_VIDEO_AVERAGE_RGB'; value: RGB | null }
	// Device Tab
	| { type: 'GET_DEVICE_TAB'; deviceCount: number }
	// Video Tab
	| {
			type: 'GET_VIDEO_TAB';
			hasVideoTab: boolean;
			isVideoTab: boolean;
			isCurrentTabValid: boolean;
			videoTitle: string | null;
	  };

type MessageResponse<T extends Response['type']> = Omit<Extract<Response, { type: T }>, 'type'>;

type ScriptSource = 'CUSTOM' | 'REMOTE' | 'AUTO';
type Script = {
	name: string | null;
	data: Keyframe[] | null;
};

export type { Keyframe, Message, MessageResponse, ScriptSource, Script };
