import DeviceController from '@/content/DeviceController';
import { DEVICE_NAME, SERVICE_UUID } from '@/utility/constant';

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
	// if (true) {
	// 	const device = {
	// 		id: 'dummyId',
	// 		name: 'dummyName',
	// 	} as BluetoothDevice;
	// 	const characteristic = {} as BluetoothRemoteGATTCharacteristic;
	// 	return new DeviceController(device, characteristic);
	// }

	const device = await handleDeviceConnect();
	if (!device) return;

	const characteristic = await getCharacteristic(device);
	if (!characteristic) return;

	return new DeviceController(device, characteristic);
};

export { initDeviceController };
