import type { Keyframe } from '@dl_sean/ado-light-show-common/src/type';

type Message =
	// Tab
	| { type: 'GET_TAB' }
	// Session
	| { type: 'GET_SESSION' }
	| ({ type: 'SESSION_UPDATED' } & MessageResponse<'GET_SESSION'>)
	// Script
	| { type: 'GET_SCRIPT' }
	| { type: 'SET_SCRIPT'; source: ScriptSource; script?: Script }
	| ({ type: 'SCRIPT_UPDATED' } & MessageResponse<'GET_SCRIPT'>)
	// Device
	| { type: 'GET_DEVICE_NAME' }
	// Video
	| { type: 'GET_VIDEO_TITLE' }
	| { type: 'GET_VIDEO_TIME' }
	| { type: 'SET_VIDEO_PLAYING'; value: boolean }
	// Command
	| { type: 'SEND_RGB_COMMAND'; value: string }
	// Content Script
	| { type: 'ACTIVATE' }
	| { type: 'DEACTIVATE' }
	// Background Script
	| { type: 'DEVICE_CONNECTED'; device: Device }
	| { type: 'DEVICE_DISCONNECTED' };
type Response =
	// Tab
	| { type: 'GET_TAB'; value: chrome.tabs.Tab | null }
	// Session
	| {
			type: 'GET_SESSION';
			status: Session['status'];
			name?: string | null;
			deviceName?: Device['name'] | null;
	  }
	// Script
	| { type: 'GET_SCRIPT'; source: ScriptSource; script: Script }
	| { type: 'SET_SCRIPT'; source: ScriptSource; name: Script['name'] }
	// Device
	| { type: 'GET_DEVICE_NAME'; value: Device['name'] }
	// Video
	| { type: 'GET_VIDEO_TITLE'; value: string | null }
	| { type: 'GET_VIDEO_TIME'; value: number };
type MessageResponse<T extends Response['type']> = Omit<Extract<Response, { type: T }>, 'type'>;

type Device = { id: BluetoothDevice['id']; name: BluetoothDevice['name'] };
type Session = { status: 'ACTIVATED'; tabID: number } | { status: 'DEACTIVATED' };

type ScriptSource = 'CUSTOM' | 'REMOTE';
type Script = {
	name: string | null;
	data: Keyframe[] | null;
};

export type { Keyframe, Message, MessageResponse, Device, Session, ScriptSource, Script };
