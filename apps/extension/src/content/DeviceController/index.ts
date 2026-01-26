import { getColorCommand } from '@/crypto/encoder';
import { isSameCommand, rgbToHex } from '@/utility/helper';
import type { RGB } from '@/utility/type';

class DeviceController {
	private device: BluetoothDevice | null = null;
	private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
	private previousCommand: Uint8Array<ArrayBuffer> | null = null;
	private previousSentTime: number = 0;
	private isWriting: boolean = false;

	constructor(device: BluetoothDevice, characteristic: BluetoothRemoteGATTCharacteristic) {
		this.device = device;
		this.characteristic = characteristic;
	}

	public getDevice() {
		return this.device;
	}

	public handleSendCommand = async (rgb: RGB) => {
		if (this.isWriting || this.characteristic == null) return;
		const command = await getColorCommand(rgbToHex(rgb));

		// Throttle
		const offset = 10; // ms
		const now = performance.now();
		if (now - this.previousSentTime < offset) return;

		// Skip if identical to previous command
		if (!!this.previousCommand && isSameCommand(this.previousCommand, command)) return;

		// Send BLE command
		this.isWriting = true;
		await this.characteristic.writeValueWithResponse(command);
		this.isWriting = false;
		this.previousSentTime = now;
		this.previousCommand = command;
	};

	public destroy() {
		this.characteristic = null;
		this.device?.gatt?.disconnect();
		this.device = null;
	}
}

export default DeviceController;
