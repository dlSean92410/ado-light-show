import { useCallback, useEffect, useState } from 'react';
import type { Message, MessageResponse } from '@/utility/type';

const useDeviceTab = () => {
	const [id, setId] = useState<number | null>(null);
	const [deviceCount, setDeviceCount] = useState<number>(0);

	useEffect(() => {
		chrome.runtime.sendMessage<Message, MessageResponse<'GET_DEVICE_TAB'>>(
			{ type: 'GET_DEVICE_TAB' },
			(message) => {
				setId(message.id);
				setDeviceCount(message.deviceCount);
			},
		);

		const handler = (message: Message) => {
			if (message.type === 'DEVICE_TAB_UPDATED') {
				setId(message.id);
				setDeviceCount(message.deviceCount);
			}
		};

		chrome.runtime.onMessage.addListener(handler);
		return () => chrome.runtime.onMessage.removeListener(handler);
	}, []);

	const handleFocusDeviceTab = useCallback(async () => {
		if (id != null) {
			chrome.tabs.update(id, { active: true });
			window.close();
			return;
		}

		chrome.runtime.sendMessage<Message>({ type: 'OPEN_DEVICE_TAB' });
		window.close();
	}, [id]);

	return {
		id,
		deviceCount,
		handleFocusDeviceTab,
	};
};

export default useDeviceTab;
