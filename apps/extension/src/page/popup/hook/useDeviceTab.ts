import { useCallback, useEffect, useState } from 'react';
import type { Message, MessageResponse } from '@/utility/type';

const useDeviceTab = () => {
	const [deviceCount, setDeviceCount] = useState<number>(0);

	useEffect(() => {
		chrome.runtime.sendMessage<Message, MessageResponse<'GET_DEVICE_TAB'>>(
			{ type: 'GET_DEVICE_TAB' },
			(message) => {
				setDeviceCount(message.deviceCount);
			},
		);

		const handler = (message: Message) => {
			if (message.type === 'DEVICE_TAB_UPDATED') {
				setDeviceCount(message.deviceCount);
			}
		};

		chrome.runtime.onMessage.addListener(handler);
		return () => chrome.runtime.onMessage.removeListener(handler);
	}, []);

	const handleTabFocus = useCallback(async () => {
		chrome.runtime.sendMessage<Message>({ type: 'FOCUS_DEVICE_TAB' });
	}, []);

	return {
		deviceCount,
		handleTabFocus,
	};
};

export default useDeviceTab;
