import type {
	OnKeyframe,
	FadeKeyframe,
	LoopKeyframe,
	PulseKeyframe,
	Keyframe,
	RGB,
} from '@dl_sean/ado-light-show-common/src/type';

type EditableKeyframe = Keyframe & { id: string };

export type {
	OnKeyframe,
	FadeKeyframe,
	LoopKeyframe,
	PulseKeyframe,
	Keyframe,
	EditableKeyframe,
	RGB,
};
