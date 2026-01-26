import type { Message, Session } from '@/utility/type';
import LightEngine from '@/background/LightEngine';

(async () => {
	chrome.runtime.onInstalled.addListener(() => {
		console.debug('Ado Light Show extension installed');
	});

	let session: Session = { status: 'DEACTIVATED' };
	const lightEngine: LightEngine = new LightEngine();

	chrome.runtime.onMessage.addListener(async (message: Message, sender, sendResponse) => {
		console.debug('Ado Light Show extension background - onMessage', message);

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
					if (sender.tab?.url == null) break;
					const videoID = new URL(sender.tab.url).searchParams.get('v');

					if (
						session.status === 'ACTIVATED' ||
						sender.tab.id == null ||
						sender.tab.title == null ||
						videoID == null
					)
						break;

					session = {
						status: 'ACTIVATED',
						name: sender.tab.title,
						videoID,
						tabID: sender.tab.id,
						deviceID: message.device.id,
						deviceName: message.device.name,
					};

					chrome.runtime.sendMessage({ type: 'SESSION_UPDATED', session });
					break;
				}
				case 'DEVICE_DISCONNECTED':
					session = { status: 'DEACTIVATED' };

					chrome.runtime.sendMessage({ type: 'SESSION_UPDATED', session });
					break;
				case 'GET_SESSION':
					sendResponse({ session });
					console.debug('Ado Light Show extension background - GET_SESSION', session);
					break;
				case 'SET_SCRIPT': {
					const { source, script } = message;
					await lightEngine.setScript(session, source, script);
					sendResponse({ source, name: lightEngine.getScript().name });
					break;
				}
				case 'GET_SCRIPT':
					sendResponse({
						source: lightEngine.getScriptSource(),
						script: lightEngine.getScript(),
					});
					break;
				case 'VIDEO_PLAYING_UPDATED':
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
	});
})();
