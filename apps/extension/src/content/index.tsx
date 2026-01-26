import styleSheet from '@/style/global.css?inline';

import { createRoot } from 'react-dom/client';
import type { Message } from '@/utility/type';
import Overlay from '@/content/component/Overlay';
import type DeviceController from '@/content/DeviceController';
import VideoController from '@/content/VideoController';

(async () => {
	console.debug('Ado Light Show extension running...');

	let reactContainer: HTMLDivElement | null = null;
	let root: ReturnType<typeof createRoot> | null = null;

	const videoController = new VideoController();
	let deviceController: DeviceController | null = null;

	// #region Overlay
	const addOverlay = () => {
		if (reactContainer) return;

		const host = document.createElement('div');
		document.body.appendChild(host);

		const shadow = host.attachShadow({ mode: 'open' });

		const cssSheet = new CSSStyleSheet();
		cssSheet.replaceSync(styleSheet);
		shadow.adoptedStyleSheets = [cssSheet];

		reactContainer = document.createElement('div');
		shadow.appendChild(reactContainer);

		root = createRoot(reactContainer);
		root.render(
			<Overlay
				onComplete={(newDeviceController) => {
					deviceController = newDeviceController;
					removeOverlay();
				}}
				onCancel={removeOverlay}
			/>,
		);
	};
	const removeOverlay = () => {
		if (root) {
			root.unmount();
			root = null;
		}
		if (reactContainer) {
			reactContainer.remove();
			reactContainer = null;
		}
	};
	// #endregion

	chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
		console.debug('Ado Light Show extension content - onMessage', message);

		switch (message.type) {
			case 'ACTIVATE':
				addOverlay();
				break;
			case 'DEACTIVATE':
				deviceController?.destroy();
				deviceController = null;
				removeOverlay();
				chrome.runtime.sendMessage<Message>({ type: 'DEVICE_DISCONNECTED' });
				break;
			case 'GET_VIDEO_TIME': {
				const time = videoController.getVideo()?.currentTime;
				sendResponse(time == null ? -1 : time);
				break;
			}
			case 'SEND_RGB_COMMAND':
				deviceController?.handleSendCommand(message.value);
				break;
			default:
				break;
		}
	});
})();
