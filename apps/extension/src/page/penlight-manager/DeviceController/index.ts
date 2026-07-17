import { hexToBytes } from '@dl_sean/ado-light-show-common/src/command';
import { isSameCommand } from '@/page/penlight-manager/DeviceController/helper';

class DeviceController {
	private device: BluetoothDevice | null = null;
	private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
	private previousCommand: Uint8Array<ArrayBuffer> | null = null;
	private previousSentTime: number = 0;
	private isWriting: boolean = false;

	constructor(device: BluetoothDevice, characteristic: BluetoothRemoteGATTCharacteristic) {
		this.device = device;
		this.characteristic = characteristic;

		this.device.addEventListener('gattserverdisconnected', () => {
			this.destroy();
		});
	}

	public getDevice() {
		return this.device;
	}

	public handleSendCommand = async (command: string) => {
		if (this.isWriting || this.characteristic == null) return;

		// Throttle
		const offset = 5; // ms
		const now = performance.now();
		if (now - this.previousSentTime < offset) return;

		const commandBytes = hexToBytes(command);

		// Skip if identical to previous command
		if (!!this.previousCommand && isSameCommand(this.previousCommand, commandBytes)) return;

		// Send BLE command
		this.isWriting = true;
		try {
			await this.characteristic.writeValueWithResponse(commandBytes);
		} catch (error) {
			console.error(`handleSendCommand: ${error}`);
		} finally {
			this.isWriting = false;
			this.previousSentTime = now;
			this.previousCommand = commandBytes;
		}
	};

	public destroy() {
		this.characteristic = null;
		this.device?.gatt?.disconnect();
		this.device = null;
	}
}

export default DeviceController;
