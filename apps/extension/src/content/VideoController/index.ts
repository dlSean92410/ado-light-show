import type { Message } from '@/utility/type';
import { hsvToRgb, rgbToHsv } from '@dl_sean/ado-light-show-common/src/color';
import type { RGB } from '@dl_sean/ado-light-show-common/src/type';

class VideoController {
	private video: HTMLVideoElement | null = null;
	private observer: MutationObserver;
	private canvas: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;

	private prevH: number | undefined;

	constructor() {
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.canvas.width = 64;
		this.canvas.height = 36;

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

	public getAverageRGB(): RGB | null {
		if (!this.video || !this.canvas || !this.ctx) return null;

		// Draw the current frame
		const { width, height } = this.canvas;
		this.ctx.drawImage(this.video, 0, 0, width, height);
		const data = this.ctx.getImageData(0, 0, width, height).data;

		// Raw average RGB
		let r = 0,
			g = 0,
			b = 0;
		for (let i = 0; i < data.length; i += 4) {
			r += data[i];
			g += data[i + 1];
			b += data[i + 2];
		}

		const total = width * height;
		r = r / total;
		g = g / total;
		b = b / total;

		// Convert to HSV
		const hsv = rgbToHsv({ r, g, b });
		const h = this.prevH != null ? this.prevH * 0.9 + hsv.h * 0.1 : hsv.h; // Smooth hue transitions
		const s = Math.min(1, hsv.s * 1.4); // Boost saturation
		const v = hsv.v;

		// Convert to RGB
		let { r: rr, g: gg, b: bb } = hsvToRgb({ h, s, v });

		// Quantize to reduce flicker
		rr = Math.round(rr / 8) * 8;
		gg = Math.round(gg / 8) * 8;
		bb = Math.round(bb / 8) * 8;

		return { r: rr, g: gg, b: bb };
	}
}

export default VideoController;
