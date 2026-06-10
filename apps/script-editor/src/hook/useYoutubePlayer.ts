'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const YT_IFRAME_ID = 'yt-player';
const ID = {
	MAGIC: 'l0WArCNh6G0',
	唱: 'pgXpM4l_MwI',
	MIRROR: 'zsBBWBEZkFQ',
	うっせぇわ: 'Qp3b-RXtz4w',
	エンゼルシーク: 'aGSmxr-dUq0',
	// 阿修羅ちゃん: 'cyq5-StPISU',
};
const DEFAULT_VIDEO_ID = ID.エンゼルシーク;
const FPS = 30;

const useYoutubePlayer = () => {
	const playerRef = useRef<YT.Player | null>(null);
	const [title, setTitle] = useState<string | null>(null);
	const [playerState, setPlayerState] = useState<YT.PlayerState | null>(null);

	useEffect(() => {
		// Load script
		if (!window.YT) {
			const tag = document.createElement('script');
			tag.src = 'https://www.youtube.com/iframe_api';
			document.body.appendChild(tag);
		}

		// Create player
		window.onYouTubeIframeAPIReady = () => {
			if (!playerRef.current) {
				playerRef.current = new YT.Player(YT_IFRAME_ID, {
					videoId: DEFAULT_VIDEO_ID,
					events: {
						onReady: () => {
							setTitle(playerRef.current?.getVideoData().title ?? null);
						},
						onStateChange: (e) => {
							setPlayerState(e.data);
						},
					},
				});
			}
		};
	}, []);

	const loadVideo = useCallback((id: string) => {
		const currentVideoId = playerRef.current?.getVideoData().video_id;
		if (currentVideoId === id) return;

		playerRef.current?.loadVideoById(id);
		playerRef.current?.pauseVideo();
	}, []);

	const getCurrentTime = useCallback(() => {
		return playerRef.current?.getCurrentTime?.() ?? 0;
	}, []);

	const setCurrentTime = useCallback((time: number) => {
		playerRef.current?.seekTo(time, true);
	}, []);

	const seekFrameForward = useCallback(() => {
		const currentTime = playerRef.current?.getCurrentTime?.() ?? 0;
		const frameDuration = 1 / FPS;
		playerRef.current?.seekTo(currentTime + frameDuration, true);
	}, []);

	const seekFrameBackward = useCallback(() => {
		const currentTime = playerRef.current?.getCurrentTime?.() ?? 0;
		const frameDuration = 1 / FPS;
		const newTime = Math.max(0, currentTime - frameDuration);
		playerRef.current?.seekTo(newTime, true);
	}, []);

	return {
		loadVideo,
		title,
		playerState,
		getCurrentTime,
		setCurrentTime,
		seekFrameForward,
		seekFrameBackward,
	};
};

export default useYoutubePlayer;
