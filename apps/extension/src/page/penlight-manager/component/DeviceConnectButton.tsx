import type DeviceController from '@/page/penlight-manager/DeviceController';
import { initDeviceController } from '@/page/penlight-manager/DeviceController/helper';

interface Props {
	onClick: (newDeviceController: DeviceController) => void;
}

const DeviceConnectButton = ({ onClick }: Props) => {
	return (
		<button
			className="btn primary pulse"
			onClick={async () => {
				const deviceController = await initDeviceController();
				if (!deviceController) return;
				const device = deviceController.getDevice();
				if (!device) return;

				onClick(deviceController);
			}}
		>
			Connect
		</button>
	);
};

export default DeviceConnectButton;
