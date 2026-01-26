type BaseKeyframe = {
	time: number;
};
type OnKeyframe = BaseKeyframe & {
	mode: 'on';
	color: string;
};
type FadeKeyframe = BaseKeyframe & {
	mode: 'fade';
	colors: [string, string];
	offset: number;
};
type LoopKeyframe = BaseKeyframe & {
	mode: 'loop';
	colors: [string, string, ...string[]];
	offsets: [number, number, ...number[]];
};
type PulseKeyframe = BaseKeyframe & {
	mode: 'pulse';
	colors: [string, string, string];
	offsets: [number, number];
};
type Keyframe = OnKeyframe | FadeKeyframe | LoopKeyframe | PulseKeyframe;

type RGB = { r: number; g: number; b: number };

type Message =
	| {
			type:
				| 'ACTIVATE'
				| 'DEACTIVATE'
				| 'DEVICE_DISCONNECTED'
				| 'GET_SESSION'
				| 'GET_SCRIPT'
				| 'GET_VIDEO_TIME';
	  }
	| {
			type: 'DEVICE_CONNECTED';
			device: { id: BluetoothDevice['id']; name: BluetoothDevice['name'] };
	  }
	| { type: 'SESSION_UPDATED'; session: Session }
	| { type: 'SET_SCRIPT'; source: ScriptSource; script?: Script }
	| { type: 'SCRIPT_UPDATED'; script: Script }
	| { type: 'VIDEO_PLAYING_UPDATED'; value: boolean }
	| { type: 'SEND_RGB_COMMAND'; value: RGB };

type Session =
	| {
			status: 'ACTIVATED';
			name: string;
			videoID: string;
			tabID: number;
			deviceID: BluetoothDevice['id'];
			deviceName: BluetoothDevice['name'];
	  }
	| { status: 'DEACTIVATED' };

type ScriptSource = 'CUSTOM' | 'REMOTE';
type Script = {
	name: string | null;
	data: Keyframe[] | null;
};

export type { Keyframe, RGB, Message, Session, ScriptSource, Script };
