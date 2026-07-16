import { DEVICE_NAME, SERVICE_UUID } from '@/utility/constant';
import DeviceController from '@/page/penlight-manager/DeviceController';

const isSameCommand = (cmd1: Uint8Array<ArrayBuffer>, cmd2: Uint8Array<ArrayBuffer>) => {
	if (cmd1.length !== cmd2.length) return false;

	for (let i = 0; i < cmd2.length; i++) {
		if (cmd1[i] !== cmd2[i]) return false;
	}

	return true;
};

const handleDeviceConnect = async () => {
	try {
		const device = await navigator.bluetooth.requestDevice({
			filters: [{ name: DEVICE_NAME }],
			optionalServices: [SERVICE_UUID],
		});

		return device;
	} catch (err) {
		console.error(`handleDeviceConnect: ${err}`);
		return null;
	}
};

const getCharacteristic = async (device: BluetoothDevice) => {
	try {
		if (!device.gatt) throw new Error('Missing GATT server');

		const server = await device.gatt.connect();
		const service = await server.getPrimaryService(SERVICE_UUID);
		const characteristic = await service.getCharacteristic(SERVICE_UUID);

		return characteristic;
	} catch (err) {
		console.error(`getCharacteristic: ${err}`);
		return null;
	}
};

const initDeviceController = async () => {
	const device = await handleDeviceConnect();
	if (!device) return;

	const characteristic = await getCharacteristic(device);
	if (!characteristic) return;

	return new DeviceController(device, characteristic);
};

export { isSameCommand, initDeviceController };
