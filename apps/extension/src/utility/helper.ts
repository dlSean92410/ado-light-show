import type { RGB } from '@/utility/type';

const hexToRgb = (hex: string) => {
	const rgbHex = hex.replace('#', '');
	return {
		r: parseInt(rgbHex.substring(0, 2), 16),
		g: parseInt(rgbHex.substring(2, 4), 16),
		b: parseInt(rgbHex.substring(4, 6), 16),
	};
};

const rgbToHex = ({ r, g, b }: RGB) => {
	const rHex = r.toString(16).padStart(2, '0');
	const gHex = g.toString(16).padStart(2, '0');
	const bHex = b.toString(16).padStart(2, '0');
	return `${rHex}${gHex}${bHex}`;
};

function lerpRgb(from: RGB, to: RGB, time: number) {
	const lerp = (a: number, b: number, t: number) => {
		const v = a + (b - a) * t;
		return Math.min(255, Math.max(0, Math.round(v)));
	};
	return {
		r: lerp(from.r, to.r, time),
		g: lerp(from.g, to.g, time),
		b: lerp(from.b, to.b, time),
	};
}

const isSameCommand = (cmd1: Uint8Array<ArrayBuffer>, cmd2: Uint8Array<ArrayBuffer>) => {
	if (cmd1.length !== cmd2.length) return false;

	for (let i = 0; i < cmd2.length; i++) {
		if (cmd1[i] !== cmd2[i]) return false;
	}

	return true;
};

export { rgbToHex, hexToRgb, lerpRgb, isSameCommand };
