import type { RGB } from './type';

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

const lerpRgb = (from: RGB, to: RGB, time: number) => {
	const lerp = (a: number, b: number, t: number) => {
		const v = a + (b - a) * t;
		return Math.min(255, Math.max(0, Math.round(v)));
	};
	return {
		r: lerp(from.r, to.r, time),
		g: lerp(from.g, to.g, time),
		b: lerp(from.b, to.b, time),
	};
};

const rgbToHsv = ({ r, g, b }: RGB) => {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const d = max - min;
	let h = 0;
	const s = max === 0 ? 0 : d / max;
	const v = max;

	if (d !== 0) {
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return { h, s, v };
};

const hsvToRgb = ({ h, s, v }: { h: number; s: number; v: number }) => {
	let r = 0,
		g = 0,
		b = 0;

	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);

	switch (i % 6) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
		case 1:
			r = q;
			g = v;
			b = p;
			break;
		case 2:
			r = p;
			g = v;
			b = t;
			break;
		case 3:
			r = p;
			g = q;
			b = v;
			break;
		case 4:
			r = t;
			g = p;
			b = v;
			break;
		case 5:
			r = v;
			g = p;
			b = q;
			break;
	}

	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255),
	};
};

export { hexToRgb, rgbToHex, lerpRgb, rgbToHsv, hsvToRgb };
