import { useCallback, useEffect, useState } from 'react';
import type { Message, MessageResponse } from '@/utility/type';

const useVideoTab = () => {
	const [hasVideoTab, setHasVideoTab] = useState<boolean>(false);
	const [isVideoTab, setIsVideoTab] = useState<boolean>(false);
	const [isCurrentTabValid, setIsCurrentTabValid] = useState<boolean>(false);
	const [videoTitle, setVideoTitle] = useState<string | null>(null);

	useEffect(() => {
		chrome.runtime.sendMessage<Message, MessageResponse<'GET_VIDEO_TAB'>>(
			{ type: 'GET_VIDEO_TAB' },
			(message) => {
				setHasVideoTab(message.hasVideoTab);
				setIsVideoTab(message.isVideoTab);
				setIsCurrentTabValid(message.isCurrentTabValid);
				setVideoTitle(message.videoTitle);
			},
		);

		const handler = (message: Message) => {
			if (message.type === 'VIDEO_TAB_UPDATED') {
				setHasVideoTab(message.hasVideoTab);
				setIsVideoTab(message.isVideoTab);
				setIsCurrentTabValid(message.isCurrentTabValid);
				setVideoTitle(message.videoTitle);
			}
		};

		chrome.runtime.onMessage.addListener(handler);
		return () => chrome.runtime.onMessage.removeListener(handler);
	}, []);

	const handleTabFocus = useCallback(async () => {
		chrome.runtime.sendMessage<Message>({ type: 'FOCUS_VIDEO_TAB' });
	}, []);

	const handleSetTabState = useCallback(async (value: boolean) => {
		chrome.runtime.sendMessage<Message>({ type: 'SET_VIDEO_TAB_STATE', value });
	}, []);

	return {
		hasVideoTab,
		isVideoTab,
		isCurrentTabValid,
		videoTitle,
		handleTabFocus,
		handleSetTabState,
	};
};

export default useVideoTab;
