import type { Message, MessageResponse } from '@/utility/type';

const getTab = async (tabId: number) => {
	const value = await new Promise<chrome.tabs.Tab | null>((resolve) => {
		chrome.tabs.get(tabId, (tab) => {
			if (chrome.runtime.lastError) {
				resolve(null);
				return;
			}

			resolve(tab);
		});
	});

	return value;
};

const getVideoId = async (tabId: number) => {
	const tab = await getTab(tabId);
	if (!tab?.url) return null;

	return new URL(tab.url).searchParams.get('v');
};

const getCurrentTab = async () => {
	const value = await new Promise<chrome.tabs.Tab | null>((resolve) => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			resolve(tabs[0] ?? null);
		});
	});

	return value;
};

const getVideoTitle = async (tabId: number) => {
	const value = await new Promise<MessageResponse<'GET_VIDEO_TITLE'>['value'] | undefined>(
		(resolve) => {
			chrome.tabs.sendMessage<Message, MessageResponse<'GET_VIDEO_TITLE'>>(
				tabId,
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

const getVideoTime = async (tabId: number) => {
	const value = await new Promise<MessageResponse<'GET_VIDEO_TIME'>['value'] | undefined>(
		(resolve) => {
			chrome.tabs.sendMessage<Message, MessageResponse<'GET_VIDEO_TIME'>>(
				tabId,
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

const getVideoAverageRGB = async (tabId: number) => {
	const value = await new Promise<MessageResponse<'GET_VIDEO_AVERAGE_RGB'>['value'] | undefined>(
		(resolve) => {
			chrome.tabs.sendMessage<Message, MessageResponse<'GET_VIDEO_AVERAGE_RGB'>>(
				tabId,
				{ type: 'GET_VIDEO_AVERAGE_RGB' },
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

const getCurrentTabInformation = async () => {
	const currentTab = await getCurrentTab();
	const currentTabId = currentTab?.id ?? null;
	const isYouTubeURL = currentTab?.url?.match(/youtube\.com\/watch\?v=/);
	const isCurrentTabValid = !!isYouTubeURL && currentTabId != null;

	return { currentTabId, isCurrentTabValid };
};
const getVideoTabInformation = async (videoTabId: number | null) => {
	const currentTab = await getCurrentTab();
	const currentTabId = currentTab?.id ?? null;
	const hasVideoTab = videoTabId != null;
	const isVideoTab = hasVideoTab && currentTabId != null && videoTabId === currentTabId;
	const videoTitle = hasVideoTab ? ((await getVideoTitle(videoTabId!)) ?? null) : null;

	return { hasVideoTab, isVideoTab, videoTitle };
};

export {
	getVideoId,
	getCurrentTab,
	getVideoTitle,
	getVideoTime,
	getVideoAverageRGB,
	getCurrentTabInformation,
	getVideoTabInformation,
};
