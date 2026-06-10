import { RGB } from './type';

// hex  - 0xRRGGBB
// mask - 0x0000ff
export function hexToRgb(hex: u32): RGB {
	const r = <u8>((hex >> 16) & 0xff);
	const g = <u8>((hex >> 8) & 0xff);
	const b = <u8>(hex & 0xff);
	return new RGB(r, g, b);
}

export function rgbToHex(rgb: RGB): u32 {
	const r = (<u32>rgb.r) << 16;
	const g = (<u32>rgb.g) << 8;
	const b = <u32>rgb.b;
	return r | g | b;
}

export function rgbToHexString(rgb: RGB): string {
	const r = rgb.r.toString(16).padStart(2, '0');
	const g = rgb.g.toString(16).padStart(2, '0');
	const b = rgb.b.toString(16).padStart(2, '0');
	return r + g + b;
}

export function lerpRgb(from: RGB, to: RGB, time: f32): RGB {
	const r = <u8>Math.round(from.r + (to.r - from.r) * time);
	const g = <u8>Math.round(from.g + (to.g - from.g) * time);
	const b = <u8>Math.round(from.b + (to.b - from.b) * time);
	return new RGB(r, g, b);
}
