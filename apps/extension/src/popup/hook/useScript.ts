import { useCallback, useEffect, useState } from 'react';
import type { Keyframe, Message, Script, ScriptSource } from '@/utility/type';

export function useScript() {
	const [source, setSource] = useState<ScriptSource>('CUSTOM');
	const [name, setName] = useState<Script['name']>(null);

	useEffect(() => {
		chrome.runtime.sendMessage<Message, { source: ScriptSource; script: Script }>(
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
		chrome.runtime.sendMessage<Message, { source: ScriptSource; name: Script['name'] }>(
			{ type: 'SET_SCRIPT', source: newScriptSource },
			(message) => {
				setSource(newScriptSource);
				setName(message.name);
			},
		);
	}, []);

	// Update script data must be from 'CUSTOM' source
	const handleUpdateScript = useCallback((newScript: Script) => {
		chrome.runtime.sendMessage<Message, { source: ScriptSource; name: Script['name'] }>(
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
						console.debug('Loaded script:', parsed);
						const data = parsed.map(
							(kf: Keyframe): Keyframe => ({
								...kf,
								time:
									kf.mode === 'pulse'
										? Number((kf.time - kf.offsets[0]).toFixed(4))
										: Number(kf.time.toFixed(4)),
							}),
						);

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
}
