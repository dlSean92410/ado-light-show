import type { Message } from '@/utility/type';

class VideoController {
	private video: HTMLVideoElement | null = null;
	private observer: MutationObserver;

	constructor() {
		// Observe YouTube DOM changes to detect video swaps
		this.observer = new MutationObserver(() => {
			const newVideo = document.querySelector('video');
			if (newVideo === this.video) return;

			this.setVideo(newVideo);
		});
		this.observer.observe(document.body, { childList: true, subtree: true });

		// Initial video detection
		this.setVideo(document.querySelector('video'));
	}

	// Attach/detach listeners when YouTube swaps the <video>
	private setVideo(newVideo: HTMLVideoElement | null) {
		this.video?.removeEventListener('play', this.start);
		this.video?.removeEventListener('pause', this.stop);
		this.video?.removeEventListener('ended', this.stop);

		newVideo?.addEventListener('play', this.start);
		newVideo?.addEventListener('pause', this.stop);
		newVideo?.addEventListener('ended', this.stop);

		this.video = newVideo;
		if (this.video)
			chrome.runtime.sendMessage<Message>({
				type: 'SET_LIGHT_ENGINE_STATE',
				value: !this.video.paused,
			});
	}
	private start = () => {
		chrome.runtime.sendMessage<Message>({ type: 'SET_LIGHT_ENGINE_STATE', value: true });
	};
	private stop = () => {
		chrome.runtime.sendMessage<Message>({ type: 'SET_LIGHT_ENGINE_STATE', value: false });
	};

	public getVideo() {
		return this.video;
	}
	public getTitle() {
		const title = document.querySelector('h1.title yt-formatted-string');
		return title?.textContent?.trim() || null;
	}
}

export default VideoController;
