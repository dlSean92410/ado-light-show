import '@dl_sean/ado-light-show-common/src/global.css';
import { PENLIGHT_MANUAL_URL } from '@/utility/constant';
import ScriptSection from '@/page/component/ScriptSection';
import type DeviceController from '@/page/penlight-manager/DeviceController';
import type { Message } from '@/utility/type';
import { useEffect, useRef, useState } from 'react';
import VideoSection from './component/VideoSection';
import DeviceSection from './component/DeviceSection';
import DeviceConnectButton from './component/DeviceConnectButton';
import DeviceControllerSection from './component/DeviceControllerSection';

export default function App() {
	const deviceControllersRef = useRef<DeviceController[]>([]);
	const [deviceControllers, setDeviceControllers] = useState<DeviceController[]>([]);

	useEffect(() => {
		deviceControllersRef.current = deviceControllers;
	}, [deviceControllers]);

	useEffect(() => {
		const handler = (message: Message) => {
			if (message.type === 'SEND_RGB_COMMAND') {
				deviceControllersRef.current.forEach((deviceController) => {
					deviceController.handleSendCommand(message.value);
				});
			}
		};

		chrome.runtime.onMessage.addListener(handler);
		return () => chrome.runtime.onMessage.removeListener(handler);
	}, []);

	return (
		<div
			className="flex flex-column"
			style={{ maxWidth: '50vw', margin: 'auto', gap: '1rem', padding: '0.5rem' }}
		>
			<section className="flex-column">
				<div className="row">
					<h2>Penlight Manager</h2>
					<button
						className="btn accent flex justify-center items-center"
						style={{ width: '24px', height: '24px', borderRadius: '30%' }}
						onClick={() => {
							window.close();
						}}
					>
						×
					</button>
				</div>

				<div className="row">
					<h3>
						This page controls your penlight connection.
						<br />
						To avoid disconnecting, please keep this tab open and do not refresh.
						<br />
						<br />
						<span>
							Need help using your device?
							<a
								href={PENLIGHT_MANUAL_URL}
								target="_blank"
								style={{ marginInlineStart: '0.5rem' }}
							>
								Check out the penlight manual here.
							</a>
						</span>
					</h3>
				</div>

				<div className="row">
					<DeviceConnectButton
						onClick={(newDeviceController) => {
							chrome.runtime.sendMessage<Message>({
								type: 'SET_DEVICE_COUNT',
								value: deviceControllers.length + 1,
							});
							setDeviceControllers((prev) => [...prev, newDeviceController]);
						}}
					/>
				</div>
			</section>

			<DeviceControllerSection
				deviceControllers={deviceControllers}
				onDisconnect={() => {
					chrome.runtime.sendMessage<Message>({
						type: 'SET_DEVICE_COUNT',
						value: deviceControllers.length - 1,
					});
					setDeviceControllers((prev) =>
						prev.filter((deviceController) => !!deviceController.getDevice()),
					);
				}}
			/>
			<DeviceSection deviceCount={deviceControllers.length} />
			<VideoSection />
			<ScriptSection />
		</div>
	);
}
