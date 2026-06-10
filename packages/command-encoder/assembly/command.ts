import { encrypt } from './encrypt';

const HEADER = '8201';
const FOOTER = '0000000000FD4752415645';

export function getColorCommand(colorHex: string): string {
	const payload = HEADER + colorHex + FOOTER;
	const encryptedPayload = encrypt(payload);
	return encryptedPayload;
}
