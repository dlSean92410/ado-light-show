import { getCurrentTab } from '@/utility/helper';
import type { Message } from '@/utility/type';
import { useEffect, useState } from 'react';

const useCurrentTab = () => {
	const [id, setID] = useState<number | null>(null);
	const [isValid, setIsValid] = useState<boolean>(false); // Current tab is valid for session (e.g. YouTube video page)
	const [hasValidContentScript, setHasValidContentScript] = useState<boolean>(true);

	useEffect(() => {
		const init = async () => {
			const tab = await getCurrentTab();
			if (tab?.id == null) return;
			setID(tab.id);

			const isYouTubeURL = tab.url?.match(/youtube\.com\/watch\?v=/);
			setIsValid(!!isYouTubeURL);

			chrome.tabs.sendMessage<Message>(tab.id, { type: 'PING' }, (response) => {
				setHasValidContentScript(response?.pong ?? false);
			});
		};

		init();
	}, []);

	return { id, isValid, hasValidContentScript };
};

export default useCurrentTab;
