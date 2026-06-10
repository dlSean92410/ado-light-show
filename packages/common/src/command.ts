const hexToBytes = (hex: string) => {
	const out = new Uint8Array(hex.length / 2);
	for (let i = 0; i < out.length; i++) {
		out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
	}
	return out;
};

const bytesToHex = (bytes: Uint8Array) => {
	return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
};

export { hexToBytes, bytesToHex };
