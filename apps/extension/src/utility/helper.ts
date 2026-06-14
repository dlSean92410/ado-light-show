import type { Message, MessageResponse } from '@/utility/type';

const getTab = async (tabID: number) => {
	const value = await new Promise<chrome.tabs.Tab | null>((resolve) => {
		chrome.tabs.get(tabID, (tab) => {
			if (chrome.runtime.lastError) {
				resolve(null);
				return;
			}

			resolve(tab);
		});
	});

	return value;
};

const getCurrentTab = async () => {
	const value = await new Promise<chrome.tabs.Tab | null>((resolve) => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			resolve(tabs[0] ?? null);
		});
	});

	return value;
};

const getVideoID = async (tabID: number) => {
	const tab = await getTab(tabID);
	if (!tab?.url) return null;

	return new URL(tab.url).searchParams.get('v');
};

const getDeviceName = async (tabID: number) => {
	const value = await new Promise<MessageResponse<'GET_DEVICE_NAME'>['value'] | undefined>(
		(resolve) => {
			chrome.tabs.sendMessage<Message, MessageResponse<'GET_DEVICE_NAME'>>(
				tabID,
				{ type: 'GET_DEVICE_NAME' },
				(response) => {
					if (chrome.runtime.lastError) {
						resolve(undefined);
						return;
					}

					resolve(response.value);
				},
			);
		},
	);

	return value;
};

const getVideoTitle = async (tabID: number) => {
	const value = await new Promise<MessageResponse<'GET_VIDEO_TITLE'>['value'] | undefined>(
		(resolve) => {
			chrome.tabs.sendMessage<Message, MessageResponse<'GET_VIDEO_TITLE'>>(
				tabID,
				{ type: 'GET_VIDEO_TITLE' },
				(response) => {
					if (chrome.runtime.lastError) {
						resolve(undefined);
						return;
					}

					resolve(response.value);
				},
			);
		},
	);

	return value;
};

const getVideoTime = async (tabID: number) => {
	const value = await new Promise<MessageResponse<'GET_VIDEO_TIME'>['value'] | undefined>(
		(resolve) => {
			chrome.tabs.sendMessage<Message, MessageResponse<'GET_VIDEO_TIME'>>(
				tabID,
				{ type: 'GET_VIDEO_TIME' },
				(response) => {
					if (chrome.runtime.lastError) {
						resolve(undefined);
						return;
					}

					resolve(response.value);
				},
			);
		},
	);

	return value;
};

export { getTab, getCurrentTab, getVideoID, getDeviceName, getVideoTitle, getVideoTime };
