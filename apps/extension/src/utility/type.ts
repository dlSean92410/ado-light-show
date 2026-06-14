import type { Keyframe } from '@dl_sean/ado-light-show-common/src/type';

type Message =
	// Session
	| { type: 'GET_SESSION' }
	| { type: 'START_SESSION' }
	| { type: 'STOP_SESSION' }
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
	// Command
	| { type: 'SEND_RGB_COMMAND'; value: string }
	// Content Script
	| { type: 'START_PAIRING_PROCESS' }
	| { type: 'PING' }
	// Background Script
	| { type: 'SET_LIGHT_ENGINE_STATE'; value: boolean };
type Response =
	// Session
	| { type: 'GET_SESSION'; session: Session }
	// Script
	| { type: 'GET_SCRIPT'; source: ScriptSource; script: Script }
	| { type: 'SET_SCRIPT'; source: ScriptSource; name: Script['name'] }
	// Device
	| { type: 'GET_DEVICE_NAME'; value: Device['name'] }
	// Video
	| { type: 'GET_VIDEO_TITLE'; value: string | null }
	| { type: 'GET_VIDEO_TIME'; value: number }
	// Content Script
	| { type: 'PING'; pong: boolean };

type MessageResponse<T extends Response['type']> = Omit<Extract<Response, { type: T }>, 'type'>;

type Device = { id: BluetoothDevice['id']; name: BluetoothDevice['name'] };
type Session = { isActive: true; tabID: number } | { isActive: false };

type ScriptSource = 'CUSTOM' | 'REMOTE';
type Script = {
	name: string | null;
	data: Keyframe[] | null;
};

export type { Keyframe, Message, MessageResponse, Device, Session, ScriptSource, Script };
