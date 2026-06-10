import type { Message, MessageResponse, Session } from '@/utility/type';
import LightEngine from '@/background/LightEngine';
import { initCommandEncoder } from '@dl_sean/ado-light-show-common/src/command-encoder-wrapper';

(async () => {
	chrome.runtime.onInstalled.addListener(() => {
		console.debug('Ado Light Show extension installed');
	});

	let session: Session = { status: 'DEACTIVATED' };
	const encoderWrapper = await initCommandEncoder(chrome.runtime.getURL('command-encoder.wasm'));
	const lightEngine: LightEngine = new LightEngine(encoderWrapper);

	chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
		console.debug('Ado Light Show extension background - onMessage - Session', sender, session);
		console.debug('Ado Light Show extension background - onMessage', message);

		(async () => {
			try {
				switch (message.type) {
					case 'ACTIVATE':
						if (session.status === 'ACTIVATED') break;

						chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
							const activeTabID = tabs[0]?.id;
							if (activeTabID == null) return;
							chrome.tabs.sendMessage<Message>(activeTabID, { type: 'ACTIVATE' });
						});
						break;
					case 'DEACTIVATE':
						if (session.status === 'DEACTIVATED') break;

						chrome.tabs.sendMessage<Message>(session.tabID, { type: 'DEACTIVATE' });
						break;
					case 'DEVICE_CONNECTED': {
						if (session.status === 'ACTIVATED' || sender.tab?.id == null) break;

						session = { status: 'ACTIVATED', tabID: sender.tab.id };

						const tabID = session.tabID;
						const { value: deviceName } = await new Promise<
							MessageResponse<'GET_DEVICE_NAME'>
						>((resolve) => {
							chrome.tabs.sendMessage<Message, MessageResponse<'GET_DEVICE_NAME'>>(
								tabID,
								{ type: 'GET_DEVICE_NAME' },
								(response) => resolve(response),
							);
						});
						const { value: videoTitle } = await new Promise<
							MessageResponse<'GET_VIDEO_TITLE'>
						>((resolve) => {
							chrome.tabs.sendMessage<Message, MessageResponse<'GET_VIDEO_TITLE'>>(
								tabID,
								{ type: 'GET_VIDEO_TITLE' },
								(response) => resolve(response),
							);
						});
						chrome.runtime.sendMessage<Message>({
							type: 'SESSION_UPDATED',
							status: session.status,
							name: videoTitle,
							deviceName: deviceName,
						});

						break;
					}
					case 'DEVICE_DISCONNECTED': {
						session = { status: 'DEACTIVATED' };
						chrome.runtime.sendMessage<Message>({
							type: 'SESSION_UPDATED',
							status: session.status,
						});

						const { source, script } = await lightEngine.setScript(session);
						chrome.runtime.sendMessage<Message>({
							type: 'SCRIPT_UPDATED',
							source,
							script,
						});
						break;
					}
					case 'GET_TAB': {
						let response: MessageResponse<'GET_TAB'> = { value: null };

						if (session.status === 'ACTIVATED') {
							const tabID = session.tabID;

							response = await new Promise<MessageResponse<'GET_TAB'>>((resolve) => {
								chrome.tabs.get(tabID, (tab) => {
									resolve({ value: tab });
								});
							});
						}

						console.debug('Ado Light Show extension background - GET_TAB', response);
						sendResponse(response);
						break;
					}
					case 'GET_SESSION': {
						console.debug('Ado Light Show extension background - GET_SESSION', session);

						// Sometimes the background script loses session info, try to recover it
						const tabID =
							session.status === 'ACTIVATED'
								? session.tabID
								: await new Promise<number | null>((resolve) => {
										chrome.tabs.query(
											{ active: true, currentWindow: true },
											(tabs) => {
												const activeTabID = tabs[0]?.id;
												resolve(activeTabID ?? null);
											},
										);
									});
						if (tabID == null) {
							const activeResponse: MessageResponse<'GET_SESSION'> = {
								status: session.status,
							};
							sendResponse(activeResponse);
							break;
						}

						const { value: deviceName } = await new Promise<
							MessageResponse<'GET_DEVICE_NAME'>
						>((resolve) => {
							chrome.tabs.sendMessage<Message, MessageResponse<'GET_DEVICE_NAME'>>(
								tabID,
								{ type: 'GET_DEVICE_NAME' },
								(response) => resolve(response ?? { value: null }),
							);
						});
						const { value: videoTitle } = await new Promise<
							MessageResponse<'GET_VIDEO_TITLE'>
						>((resolve) => {
							chrome.tabs.sendMessage<Message, MessageResponse<'GET_VIDEO_TITLE'>>(
								tabID,
								{ type: 'GET_VIDEO_TITLE' },
								(response) => resolve(response ?? { value: null }),
							);
						});

						const activeResponse: MessageResponse<'GET_SESSION'> = {
							status: session.status,
							name: videoTitle,
							deviceName,
						};
						console.debug(
							'Ado Light Show extension background - GET_SESSION',
							activeResponse,
						);
						sendResponse(activeResponse);
						break;
					}
					case 'SET_SCRIPT': {
						const { source, script } = message;
						lightEngine.setScriptSource(source);
						await lightEngine.setScript(session, script);
						const name = lightEngine.getScript().name;

						const response: MessageResponse<'SET_SCRIPT'> = { source, name };
						sendResponse(response);
						break;
					}
					case 'GET_SCRIPT': {
						const source = lightEngine.getScriptSource();
						const script = lightEngine.getScript();

						const response: MessageResponse<'GET_SCRIPT'> = { source, script };
						sendResponse(response);
						break;
					}
					case 'SET_VIDEO_PLAYING':
						if (message.value) lightEngine.start(session);
						else lightEngine.stop();
						break;
					default:
						break;
				}
			} catch (err) {
				console.error(`${message.type}: ${err}`);
				return null;
			}
		})();

		return true;
	});

	chrome.tabs.onActivated.addListener(async () => {
		const { source, script } = await lightEngine.setScript(session);
		chrome.runtime.sendMessage<Message>({ type: 'SCRIPT_UPDATED', source, script });
	});
})();
