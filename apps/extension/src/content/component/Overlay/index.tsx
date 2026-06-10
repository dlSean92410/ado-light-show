import DeviceController from '@/content/DeviceController';
import type { Message } from '@/utility/type';

import { initDeviceController } from './helper';

interface Props {
	onComplete: (deviceController: DeviceController) => void;
	onCancel: () => void;
}
const Overlay = ({ onComplete, onCancel }: Props) => {
	const onConnected = (deviceController: DeviceController) => {
		const device = deviceController.getDevice();
		if (!device) return;

		chrome.runtime.sendMessage<Message>({
			type: 'DEVICE_CONNECTED',
			device: { id: device.id, name: device.name },
		});
		onComplete(deviceController);
	};

	return (
		<div className="overlay">
			<div className="flex-column container" style={{ gap: '1rem' }}>
				<h2>Connect your device</h2>

				<section className="flex-column scrollable">
					<label>
						Click the <b>Connect</b> button and select <b>Ado Light Stick</b> in the
						device list.
					</label>
					<img src={chrome.runtime.getURL('tutorial1.png')} alt="" width="60%" />

					<label>
						If you don't see <b>Ado Light Stick</b>, please make sure your device is
						nearby and in pairing mode by holding this button on your device.
					</label>
					<img src={chrome.runtime.getURL('tutorial2.jpeg')} alt="" width="60%" />
				</section>

				<section className="bottom">
					<button className="btn secondary" onClick={onCancel}>
						Cancel
					</button>
					<button
						className="btn primary pulse"
						onClick={async () => {
							const deviceController = await initDeviceController();
							if (!deviceController) return;

							onConnected(deviceController);
						}}
					>
						Connect
					</button>
				</section>
			</div>
		</div>
	);
};

export default Overlay;
