// ============================================================
//  AES‑128‑ECB (NoPadding) encryption
// ============================================================

// ------------------------------------------------------------
// AES key - 2174516473A1F5351004A13E6B716AB9
// ------------------------------------------------------------
const KEY_BYTES: u8[] = [
	0x21, 0x74, 0x51, 0x64, 0x73, 0xa1, 0xf5, 0x35, 0x10, 0x04, 0xa1, 0x3e, 0x6b, 0x71, 0x6a, 0xb9,
];

// ============================================================
//  Hex utilities
// ============================================================

function hexToBytes(hex: string): Uint8Array {
	const len = hex.length >>> 1;
	const out = new Uint8Array(len);

	for (let i = 0; i < len; i++) {
		const hi = hex.charCodeAt(i * 2);
		const lo = hex.charCodeAt(i * 2 + 1);

		const hiVal = hi <= 57 ? hi - 48 : (hi & 0xdf) - 55;
		const loVal = lo <= 57 ? lo - 48 : (lo & 0xdf) - 55;

		out[i] = <u8>((hiVal << 4) | loVal);
	}

	return out;
}

function bytesToHex(bytes: Uint8Array): string {
	const hexChars = '0123456789abcdef';
	let out = '';

	for (let i = 0; i < bytes.length; i++) {
		const b = bytes[i];
		out += hexChars.charAt(b >>> 4);
		out += hexChars.charAt(b & 0x0f);
	}

	return out;
}

// ============================================================
//  AES constants
// ============================================================

const SBOX: u8[] = [
	0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
	0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
	0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
	0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
	0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
	0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
	0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
	0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
	0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
	0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
	0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
	0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
	0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
	0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
	0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
	0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
];

const RCON: u8[] = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

function sbox(x: u8): u8 {
	return SBOX[x];
}

// ============================================================
//  Key expansion
// ============================================================

function expandKey(): Uint8Array {
	const key = new Uint8Array(16);
	for (let i = 0; i < 16; i++) key[i] = KEY_BYTES[i];

	const out = new Uint8Array(176);
	for (let i = 0; i < 16; i++) out[i] = key[i];

	let bytes = 16;
	let r = 1;
	const temp = new Uint8Array(4);

	while (bytes < 176) {
		for (let i = 0; i < 4; i++) temp[i] = out[bytes - 4 + i];

		if (bytes % 16 == 0) {
			const t = temp[0];
			temp[0] = temp[1];
			temp[1] = temp[2];
			temp[2] = temp[3];
			temp[3] = t;

			for (let i = 0; i < 4; i++) temp[i] = sbox(temp[i]);
			temp[0] ^= RCON[r++];
		}

		for (let i = 0; i < 4; i++) {
			out[bytes] = out[bytes - 16] ^ temp[i];
			bytes++;
		}
	}

	return out;
}

// ============================================================
//  AES block operations
// ============================================================

function xtime(x: u8): u8 {
	return ((x << 1) ^ (((x >> 7) & 1) * 0x1b)) & 0xff;
}

function mixColumns(s: Uint8Array): void {
	for (let c = 0; c < 4; c++) {
		const i = c * 4;
		const a0 = s[i],
			a1 = s[i + 1],
			a2 = s[i + 2],
			a3 = s[i + 3];
		const t = a0 ^ a1 ^ a2 ^ a3;

		s[i] = a0 ^ t ^ xtime(<u8>(a0 ^ a1));
		s[i + 1] = a1 ^ t ^ xtime(<u8>(a1 ^ a2));
		s[i + 2] = a2 ^ t ^ xtime(<u8>(a2 ^ a3));
		s[i + 3] = a3 ^ t ^ xtime(<u8>(a3 ^ a0));
	}
}

function subBytes(s: Uint8Array): void {
	for (let i = 0; i < 16; i++) s[i] = sbox(s[i]);
}

function shiftRows(s: Uint8Array): void {
	let t = s[1];
	s[1] = s[5];
	s[5] = s[9];
	s[9] = s[13];
	s[13] = t;

	t = s[2];
	let t2 = s[6];
	s[2] = s[10];
	s[6] = s[14];
	s[10] = t;
	s[14] = t2;

	t = s[3];
	s[3] = s[15];
	s[15] = s[11];
	s[11] = s[7];
	s[7] = t;
}

function addRoundKey(s: Uint8Array, rk: Uint8Array, round: i32): void {
	const off = round * 16;
	for (let i = 0; i < 16; i++) s[i] ^= rk[off + i];
}

function encryptBlock(block: Uint8Array, rk: Uint8Array): void {
	addRoundKey(block, rk, 0);

	for (let r = 1; r < 10; r++) {
		subBytes(block);
		shiftRows(block);
		mixColumns(block);
		addRoundKey(block, rk, r);
	}

	subBytes(block);
	shiftRows(block);
	addRoundKey(block, rk, 10);
}

// ============================================================
//  Exported encrypt
// ============================================================

export function encrypt(hex: string): string {
	const plain = hexToBytes(hex);

	if (plain.length % 16 != 0) {
		return hex; // must be exact block size
	}

	const rk = expandKey();
	const out = new Uint8Array(plain.length);
	const block = new Uint8Array(16);

	for (let i = 0; i < plain.length; i += 16) {
		for (let j = 0; j < 16; j++) block[j] = plain[i + j];
		encryptBlock(block, rk);
		for (let j = 0; j < 16; j++) out[i + j] = block[j];
	}

	return bytesToHex(out);
}
