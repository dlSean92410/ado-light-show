export interface CommandEncoderWrapper {
	getColorCommand(hex: string): string;
}

let cachedEncoder: CommandEncoderWrapper | null = null;
export async function initCommandEncoder(wasmUrl: string) {
	if (cachedEncoder) return cachedEncoder;

	const response = await fetch(wasmUrl);
	const bytes = await response.arrayBuffer();

	const imports = {
		env: {
			abort() {
				throw new Error('abort');
			},
		},
	};

	const { instance } = await WebAssembly.instantiate(bytes, imports);
	const wasm = instance.exports as any;
	const memory = wasm.memory as WebAssembly.Memory;

	function writeString(str: string): number {
		const len = str.length;
		const ptr = wasm.__new(len * 2, 2) as number; // 2 = String id in AS
		const buf = new Uint16Array(memory.buffer, ptr, len);
		for (let i = 0; i < len; i++) buf[i] = str.charCodeAt(i);
		return ptr;
	}

	function readString(ptr: number): string {
		if (!ptr) return '';
		const U32 = new Uint32Array(memory.buffer);
		const byteLength = U32[(ptr - 4) >>> 2];
		const charLength = byteLength >>> 1;
		const U16 = new Uint16Array(memory.buffer);
		let out = '';
		let off = ptr >>> 1;
		for (let i = 0; i < charLength; i++) {
			out += String.fromCharCode(U16[off + i]);
		}
		return out;
	}

	function getColorCommand(colorHex: string) {
		const ptr = writeString(colorHex);
		const resPtr = wasm.getColorCommand(ptr);
		return readString(resPtr);
	}

	cachedEncoder = { getColorCommand };
	return cachedEncoder;
}
