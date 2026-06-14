import { useCallback, useEffect, useState } from 'react';
import type { Device, Message, MessageResponse, Session } from '@/utility/type';
import { getCurrentTab, getDeviceName, getVideoTitle } from '@/utility/helper';

const useSession = () => {
	const [session, setSession] = useState<Session>({ isActive: false });
	const [videoTitle, setVideoTitle] = useState<string | null>(null);
	const [deviceName, setDeviceName] = useState<Device['name'] | null>(null);

	useEffect(() => {
		const handleSessionUpdate = async (session: Session) => {
			const newSession = session;
			setSession(newSession);

			const newVideoTitle = newSession.isActive
				? await getVideoTitle(newSession.tabID)
				: null;
			setVideoTitle(newVideoTitle ?? null);

			const newDeviceName = newSession.isActive
				? await getDeviceName(newSession.tabID)
				: null;
			setDeviceName(newDeviceName ?? null);
		};

		chrome.runtime.sendMessage<Message, MessageResponse<'GET_SESSION'>>(
			{ type: 'GET_SESSION' },
			async (message) => {
				if (chrome.runtime.lastError) return;

				handleSessionUpdate(message.session);
			},
		);

		const handler = (message: Message) => {
			if (message.type === 'SESSION_UPDATED') {
				handleSessionUpdate(message.session);
			}
		};

		chrome.runtime.onMessage.addListener(handler);
		return () => chrome.runtime.onMessage.removeListener(handler);
	}, []);

	const handleStartSession = useCallback(async () => {
		const tab = await getCurrentTab();
		if (session.isActive || tab?.id == null) return;

		chrome.tabs.sendMessage<Message>(tab.id, { type: 'START_PAIRING_PROCESS' });
		window.close();
	}, [session.isActive]);

	const handleStopSession = useCallback(() => {
		chrome.runtime.sendMessage<Message>({ type: 'STOP_SESSION' });
	}, []);

	return {
		tabID: session.isActive ? session.tabID : null,
		isActive: session.isActive,
		videoTitle,
		deviceName,
		handleStartSession,
		handleStopSession,
	};
};

export default useSession;
