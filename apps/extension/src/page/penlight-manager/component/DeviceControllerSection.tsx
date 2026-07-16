import type DeviceController from '@/page/penlight-manager/DeviceController';

interface Props {
	deviceControllers: DeviceController[];
	onDisconnect: () => void;
}
const DeviceControllerSection = ({ deviceControllers, onDisconnect }: Props) => {
	return (
		<section className="flex-column" style={{ maxHeight: '20vh', overflowY: 'auto' }}>
			{deviceControllers.map((deviceController) => {
				const device = deviceController?.getDevice();
				if (!device) return null;

				const { id, name } = device;
				const handleDisconnect = () => {
					deviceController.destroy();
					onDisconnect();
				};
				return (
					<div key={id} className="row">
						<span className="flex items-center">
							<span className="dot on" />
							<div>
								<label>{name}</label>
								<br />
								<label>{id}</label>
							</div>
						</span>

						<button
							className="btn accent"
							style={{ width: 'auto' }}
							onClick={handleDisconnect}
						>
							Disconnect
						</button>
					</div>
				);
			})}
		</section>
	);
};

export default DeviceControllerSection;
