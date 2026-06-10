type BaseKeyframe = {
	time: number;
	mode: 'on' | 'fade' | 'loop' | 'pulse';
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
	colors: string[];
	offsets: number[];
};

type PulseKeyframe = BaseKeyframe & {
	mode: 'pulse';
	colors: [string, string, string];
	offsets: [number, number];
};

type Keyframe = OnKeyframe | FadeKeyframe | LoopKeyframe | PulseKeyframe;

type RGB = { r: number; g: number; b: number };

export type { BaseKeyframe, OnKeyframe, FadeKeyframe, LoopKeyframe, PulseKeyframe, Keyframe, RGB };
