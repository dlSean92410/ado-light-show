import type { Session } from '@/utility/type';

const getVideoID = async (session: Session) => {
	const activeTabID = await new Promise<number | null>((resolve) => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			resolve(tabs[0]?.id ?? null);
		});
	});

	const tabID = session.status === 'ACTIVATED' ? session.tabID : activeTabID;
	if (tabID == null) return null;

	const videoID = await new Promise<string | null>((resolve) => {
		chrome.tabs.get(tabID, ({ url }) => {
			const videoID = url ? new URL(url).searchParams.get('v') : null;
			if (videoID == null) {
				resolve(null);
				return;
			}

			resolve(videoID);
		});
	});
	return videoID;
};

export { getVideoID };
