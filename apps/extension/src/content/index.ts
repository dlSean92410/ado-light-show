import type { Message, MessageResponse } from '@/utility/type';
import VideoController from '@/content/VideoController';

(async () => {
	console.debug('Ado Light Show extension running...');

	const videoController = new VideoController();

	chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
		console.debug('Ado Light Show extension content - onMessage', { message });

		switch (message.type) {
			case 'GET_VIDEO_TITLE': {
				const title = videoController.getTitle();
				const response: MessageResponse<'GET_VIDEO_TITLE'> = { value: title };
				sendResponse(response);
				break;
			}
			case 'GET_VIDEO_TIME': {
				const time = videoController.getVideo()?.currentTime ?? -1;
				const response: MessageResponse<'GET_VIDEO_TIME'> = { value: time };
				sendResponse(response);
				break;
			}
			case 'GET_VIDEO_AVERAGE_RGB': {
				const rgb = videoController.getAverageRGB();
				const response: MessageResponse<'GET_VIDEO_AVERAGE_RGB'> = { value: rgb };
				sendResponse(response);
				break;
			}
			default:
				break;
		}
	});
})();
