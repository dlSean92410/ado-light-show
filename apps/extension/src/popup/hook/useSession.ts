import { useCallback, useEffect, useState } from 'react';
import type { Message, Session } from '@/utility/type';

const useSession = () => {
	const [session, setSession] = useState<Session>({ status: 'DEACTIVATED' });

	useEffect(() => {
		chrome.runtime.sendMessage<Message, { session: Session }>(
			{ type: 'GET_SESSION' },
			(message) => {
				setSession(message.session);
			},
		);

		const handler = (message: Message) => {
			if (message.type === 'SESSION_UPDATED') {
				setSession(message.session);
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
		session,
		handleInitiateSession,
		handleStopSession,
	};
};

export default useSession;
