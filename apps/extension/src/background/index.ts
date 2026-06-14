import type { Message, MessageResponse, Session } from '@/utility/type';
import { getCurrentTab, getVideoID } from '@/utility/helper';
import LightEngine from '@/background/LightEngine';
import { initCommandEncoder } from '@dl_sean/ado-light-show-common/src/command-encoder-wrapper';

(async () => {
	chrome.runtime.onInstalled.addListener(() => {
		console.debug('Ado Light Show extension installed');
	});

	let session: Session = { isActive: false };
	/**
	 * Callback used by LightEngine loop to get current active tab ID.
	 * Rather than a fixed tabID when .start() is called, this allows the loop to evaluate the tabID from session on each iteration.
	 */
	const getTabID = () => {
		if (!session.isActive) return null;
		return session.tabID;
	};
	const encoderWrapper = await initCommandEncoder(chrome.runtime.getURL('command-encoder.wasm'));
	const lightEngine: LightEngine = new LightEngine(encoderWrapper);

	chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
		console.debug('Ado Light Show extension background - onMessage', {
			session,
			message,
			sender,
		});

		(async () => {
			try {
				switch (message.type) {
					case 'START_SESSION': {
						if (sender.tab?.id == null) break;

						session = { isActive: true, tabID: sender.tab.id };
						chrome.runtime.sendMessage<Message>({ type: 'SESSION_UPDATED', session });

						console.debug('Ado Light Show extension background - lightEngine.start', {
							session,
						});
						lightEngine.start(getTabID);
						break;
					}
					case 'STOP_SESSION': {
						if (session.isActive)
							chrome.tabs.sendMessage<Message>(session.tabID, {
								type: 'STOP_SESSION',
							});

						session = { isActive: false };
						chrome.runtime.sendMessage<Message>({ type: 'SESSION_UPDATED', session });

						lightEngine.destroy();
						break;
					}
					case 'GET_SESSION': {
						const response: MessageResponse<'GET_SESSION'> = { session };
						sendResponse(response);
						break;
					}
					case 'SET_SCRIPT': {
						const { source, script } = message;
						lightEngine.setScriptSource(source);

						const tab = session.isActive
							? { id: session.tabID }
							: await getCurrentTab();
						const videoID = tab?.id != null ? await getVideoID(tab.id) : null;
						const { source: newSource, script: newScript } =
							await lightEngine.setScript({ videoID, script });

						const response: MessageResponse<'SET_SCRIPT'> = {
							source: newSource,
							name: newScript.name,
						};
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
					case 'SET_LIGHT_ENGINE_STATE':
						if (!session.isActive || sender.tab?.id !== session.tabID) break;

						if (message.value) {
							lightEngine.start(getTabID);
						} else {
							lightEngine.stop();
						}
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

	chrome.tabs.onActivated.addListener(async ({ tabId }) => {
		if (session.isActive && session.tabID !== tabId) return;

		const tabID = session.isActive ? session.tabID : tabId;
		const videoID = tabID != null ? await getVideoID(tabID) : null;
		const { source, script } = await lightEngine.setScript({ videoID });
		chrome.runtime.sendMessage<Message>({ type: 'SCRIPT_UPDATED', source, script });
	});

	chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
		if (!changeInfo.url) return;
		if (session.isActive && session.tabID !== tabId) return;

		const tabID = session.isActive ? session.tabID : tabId;
		const videoID = tabID != null ? await getVideoID(tabID) : null;
		const { source, script } = await lightEngine.setScript({ videoID });
		chrome.runtime.sendMessage<Message>({ type: 'SCRIPT_UPDATED', source, script });
	});

	chrome.tabs.onRemoved.addListener(async (tabId) => {
		if (session.isActive && session.tabID !== tabId) return;

		session = { isActive: false };
		chrome.runtime.sendMessage<Message>({ type: 'SESSION_UPDATED', session });

		lightEngine.destroy();
	});
})();
