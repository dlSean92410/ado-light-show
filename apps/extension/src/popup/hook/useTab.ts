import type { Message, MessageResponse } from '@/utility/type';
import { useEffect, useState } from 'react';

const useTab = () => {
	const [isActive, setIsActive] = useState<boolean>(false);

	useEffect(() => {
		chrome.runtime.sendMessage<Message, MessageResponse<'GET_TAB'>>(
			{ type: 'GET_TAB' },
			(message) => {
				setIsActive(message.value?.active ?? false);
			},
		);
	}, []);

	return { isActive };
};

export default useTab;
