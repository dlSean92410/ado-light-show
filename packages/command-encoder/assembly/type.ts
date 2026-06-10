export class RGB {
	r: u8 = 0;
	g: u8 = 0;
	b: u8 = 0;

	constructor(r: u8, g: u8, b: u8) {
		this.r = r;
		this.g = g;
		this.b = b;
	}
}

// #region Currenctly unused
export enum KeyframeMode {
	On = 0,
	Fade = 1,
	Loop = 2,
	Pulse = 3,
}

export class BaseKeyframe {
	time: f32 = 0;
	mode: KeyframeMode = KeyframeMode.On;
}

export class OnKeyframe extends BaseKeyframe {
	color: u32 = 0;
}

export class FadeKeyframe extends BaseKeyframe {
	colors: Array<u32> = new Array<u32>(2); // [from, to]
	offset: f32 = 0;
}

export class LoopKeyframe extends BaseKeyframe {
	colors: Array<u32> = new Array<u32>();
	offsets: Array<f32> = new Array<f32>();
}

export class PulseKeyframe extends BaseKeyframe {
	colors: Array<u32> = new Array<u32>(3); // [start, peak, end]
	offsets: Array<f32> = new Array<f32>(2);
}
// #endregion
