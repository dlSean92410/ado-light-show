import { useCallback, useEffect, useState } from 'react';
import type { Device, Message, MessageResponse, Session } from '@/utility/type';

const useSession = () => {
	const [status, setStatus] = useState<Session['status']>('DEACTIVATED');
	const [name, setName] = useState<string | null>(null);
	const [deviceName, setDeviceName] = useState<Device['name'] | null>(null);

	useEffect(() => {
		chrome.runtime.sendMessage<Message, MessageResponse<'GET_SESSION'>>(
			{ type: 'GET_SESSION' },
			(message) => {
				setStatus(message.status);
				setName(message.name ?? null);
				setDeviceName(message.deviceName ?? null);
			},
		);

		const handler = (message: Message) => {
			if (message.type === 'SESSION_UPDATED') {
				setStatus(message.status);
				setName(message.name ?? null);
				setDeviceName(message.deviceName ?? null);
			}
		};

		chrome.runtime.onMessage.addListener(handler);
		return () => chrome.runtime.onMessage.removeListener(handler);
	}, []);

	const handleInitiateSession = useCallback(() => {
		chrome.runtime.sendMessage<Message>({ type: 'ACTIVATE' });
		window.close();
	}, []);

	const handleStopSession = useCallback(() => {
		chrome.runtime.sendMessage<Message>({ type: 'DEACTIVATE' });
	}, []);

	return {
		status,
		name,
		deviceName,
		handleInitiateSession,
		handleStopSession,
	};
};

export default useSession;
