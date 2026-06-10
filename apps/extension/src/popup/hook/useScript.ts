import { useCallback, useEffect, useState } from 'react';
import type { Keyframe, Message, MessageResponse, Script, ScriptSource } from '@/utility/type';
import { roundTime, sanitizeScript } from '@dl_sean/ado-light-show-common/src/script';

const useScript = () => {
	const [source, setSource] = useState<ScriptSource>('CUSTOM');
	const [name, setName] = useState<Script['name']>(null);

	useEffect(() => {
		chrome.runtime.sendMessage<Message, MessageResponse<'GET_SCRIPT'>>(
			{ type: 'GET_SCRIPT' },
			(message) => {
				setSource(message.source);
				setName(message.script.name);
			},
		);

		const handler = (message: Message) => {
			if (message.type === 'SCRIPT_UPDATED') {
				setName(message.script.name);
			}
		};

		chrome.runtime.onMessage.addListener(handler);
		return () => chrome.runtime.onMessage.removeListener(handler);
	}, []);

	const handleUpdateScriptSource = useCallback((newScriptSource: ScriptSource) => {
		chrome.runtime.sendMessage<Message, MessageResponse<'SET_SCRIPT'>>(
			{ type: 'SET_SCRIPT', source: newScriptSource },
			(message) => {
				setSource(newScriptSource);
				setName(message.name);
			},
		);
	}, []);

	// Update script data must be from 'CUSTOM' source
	const handleUpdateScript = useCallback((newScript: Script) => {
		chrome.runtime.sendMessage<Message, MessageResponse<'SET_SCRIPT'>>(
			{ type: 'SET_SCRIPT', source: 'CUSTOM', script: newScript },
			(message) => {
				setSource(message.source);
				setName(message.name);
			},
		);
	}, []);

	const handleCustomScriptUpload = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = (event) => {
				try {
					const parsed = JSON.parse(event.target?.result as string);
					if (Array.isArray(parsed)) {
						const data = sanitizeScript(parsed).map((kf: Keyframe) => {
							// Convert pulse time from peak to start
							const time =
								kf.mode === 'pulse' ? roundTime(kf.time - kf.offsets[0]) : kf.time;
							return { ...kf, time };
						});

						console.debug('Loaded script:', data);
						handleUpdateScript({ name: file.name, data });
					}
				} catch (err) {
					console.error('Invalid script file', err);
				}
			};
			reader.readAsText(file);
		},
		[handleUpdateScript],
	);

	return {
		source,
		name,
		handleUpdateScriptSource,
		handleCustomScriptUpload,
	};
};

export default useScript;
