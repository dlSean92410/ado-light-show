import { FadeKeyframe, LoopKeyframe, OnKeyframe, PulseKeyframe } from '@/type';

const DEFAULT_ON_KEYFRAME: OnKeyframe = {
	mode: 'on',
	time: 0,
	color: '#000000',
};
const DEFAULT_FADE_KEYFRAME: FadeKeyframe = {
	mode: 'fade',
	time: 0,
	colors: ['#000000', '#ffffff'],
	offset: 0.5,
};
const DEFAULT_PULSE_KEYFRAME: PulseKeyframe = {
	mode: 'pulse',
	time: 0,
	colors: ['#000000', '#ffffff', '#000000'],
	offsets: [0.2, 0.6],
};
const DEFAULT_LOOP_KEYFRAME: LoopKeyframe = {
	mode: 'loop',
	time: 0,
	colors: ['#000000', '#ffffff'],
	offsets: [0.5, 0.5],
};

export {
	DEFAULT_ON_KEYFRAME,
	DEFAULT_FADE_KEYFRAME,
	DEFAULT_PULSE_KEYFRAME,
	DEFAULT_LOOP_KEYFRAME,
};
