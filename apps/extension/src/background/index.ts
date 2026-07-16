import type { Message, MessageResponse } from '@/utility/type';
import {
	getVideoId,
	getCurrentTab,
	getCurrentTabInformation,
	getVideoTabInformation,
} from '@/background/helper';
import LightEngine from '@/background/LightEngine';
import { initCommandEncoder } from '@dl_sean/ado-light-show-common/src/command-encoder-wrapper';
import { PENLIGHT_MANAGER_PATH } from '@/utility/constant';

(async () => {
	const encoderWrapper = await initCommandEncoder(chrome.runtime.getURL('command-encoder.wasm'));

	// #region Light Engine
	const lightEngine: LightEngine = new LightEngine(encoderWrapper);
	const handleLightEngineLoopState = (shouldStart: boolean) => {
		if (shouldStart) {
			lightEngine.start({ videoTabId, deviceTabId });
			return;
		}

		lightEngine.stop();
	};
	// #endregion

	// #region Video Tab
	let videoTabId: number | null = null; // Determines if any video tab is synced
	// #endregion

	// #region Device Tab
	let deviceTabId: number | null = null;
	let deviceCount: number = 0; // Determines if any device is connected
	// #endregion

	chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
		console.debug('Ado Light Show extension background - onMessage', {
			message,
			sender,
		});

		(async () => {
			try {
				switch (message.type) {
					case 'SET_LIGHT_ENGINE_STATE': {
						if (videoTabId != null && videoTabId !== sender.tab?.id) return;

						handleLightEngineLoopState(message.value);
						break;
					}
					case 'GET_SCRIPT': {
						const source = lightEngine.getScriptSource();
						const name = lightEngine.getScript().name;

						const response: MessageResponse<'GET_SCRIPT'> = { source, name };
						sendResponse(response);
						break;
					}
					case 'SET_SCRIPT': {
						const { source, script } = message;
						lightEngine.setScriptSource(source);

						const tabId = videoTabId ?? (await getCurrentTab())?.id;
						const videoId = tabId != null ? await getVideoId(tabId) : null;
						const { source: newSource, script: newScript } =
							await lightEngine.setScript({ videoId, script });

						chrome.runtime.sendMessage<Message>({
							type: 'SCRIPT_UPDATED',
							source: newSource,
							name: newScript.name,
						});
						break;
					}
					case 'GET_DEVICE_TAB': {
						const response: MessageResponse<'GET_DEVICE_TAB'> = {
							deviceCount: deviceCount,
						};
						sendResponse(response);
						break;
					}
					case 'FOCUS_DEVICE_TAB': {
						if (deviceTabId != null) {
							chrome.tabs.update(deviceTabId, { active: true });
							break;
						}

						const tab = await chrome.tabs.create({
							url: chrome.runtime.getURL(PENLIGHT_MANAGER_PATH),
							pinned: true,
						});
						deviceTabId = tab.id ?? null;

						chrome.runtime.sendMessage<Message>({
							type: 'DEVICE_TAB_UPDATED',
							deviceCount: deviceCount,
						});
						break;
					}
					case 'SET_DEVICE_COUNT': {
						deviceCount = message.value;
						chrome.runtime.sendMessage<Message>({
							type: 'DEVICE_TAB_UPDATED',
							deviceCount,
						});

						handleLightEngineLoopState(videoTabId != null && deviceCount > 0);
						break;
					}
					case 'GET_VIDEO_TAB': {
						const { isCurrentTabValid } = await getCurrentTabInformation();
						const { hasVideoTab, isVideoTab, videoTitle } =
							await getVideoTabInformation(videoTabId);

						const response: MessageResponse<'GET_VIDEO_TAB'> = {
							hasVideoTab,
							isVideoTab,
							isCurrentTabValid,
							videoTitle,
						};
						sendResponse(response);
						break;
					}
					case 'FOCUS_VIDEO_TAB': {
						if (videoTabId == null) break;

						chrome.tabs.update(videoTabId, { active: true });

						break;
					}
					case 'SET_VIDEO_TAB_STATE': {
						const { currentTabId, isCurrentTabValid } =
							await getCurrentTabInformation();
						videoTabId = message.value ? currentTabId : null;
						const { hasVideoTab, isVideoTab, videoTitle } =
							await getVideoTabInformation(videoTabId);

						chrome.runtime.sendMessage<Message>({
							type: 'VIDEO_TAB_UPDATED',
							hasVideoTab,
							isVideoTab,
							isCurrentTabValid,
							videoTitle,
						});

						if (videoTabId === null) {
							await lightEngine.destroy();
						} else {
							await lightEngine.syncScript();
						}

						handleLightEngineLoopState(videoTabId != null && deviceCount > 0);
						break;
					}
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
		if (videoTabId != null && videoTabId !== tabId) return;
		await lightEngine.syncScript();
	});

	chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
		if (!changeInfo.url) return;

		if (videoTabId != null && videoTabId !== tabId) return;
		await lightEngine.syncScript();
	});

	chrome.tabs.onRemoved.addListener(async (tabId) => {
		if (tabId !== deviceTabId && tabId !== videoTabId) return;

		if (tabId === deviceTabId) {
			deviceTabId = null;
			deviceCount = 0;
			chrome.runtime.sendMessage<Message>({ type: 'DEVICE_TAB_UPDATED', deviceCount });
		} else if (tabId === videoTabId) {
			const { isCurrentTabValid } = await getCurrentTabInformation();
			videoTabId = null;
			const { hasVideoTab, isVideoTab, videoTitle } =
				await getVideoTabInformation(videoTabId);

			chrome.runtime.sendMessage<Message>({
				type: 'VIDEO_TAB_UPDATED',
				hasVideoTab,
				isVideoTab,
				isCurrentTabValid,
				videoTitle,
			});
		}
		if (videoTabId != null && videoTabId !== tabId) return;
		await lightEngine.syncScript();
		handleLightEngineLoopState(videoTabId != null && deviceCount > 0);
	});

	chrome.runtime.onInstalled.addListener(async (details) => {
		console.debug('Ado Light Show extension installed');

		if (details.reason === 'update') {
			// Refresh relevant tabs to ensure new content script is injected
			const manifest = chrome.runtime.getManifest();
			const contentScripts = manifest.content_scripts ?? [];
			for (const { matches } of contentScripts) {
				const tabs = await chrome.tabs.query({
					url: matches,
					status: 'complete',
				});

				for (const tab of tabs) {
					if (!tab.id) continue;
					await chrome.tabs.reload(tab.id);
				}
			}
		}
	});
})();
