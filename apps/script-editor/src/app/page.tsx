'use client';

import Keyframe from '@/component/Keyframe';
import useLightEngine from '@/hook/useLightEngine';
import useScript from '@/hook/useScript';
import { YT_IFRAME_ID } from '@/hook/useYoutubePlayer';
import useYoutubePlayer from '@/hook/useYoutubePlayer';
import { useEffect, useState } from 'react';

export default function Home() {
	const {
		loadVideo,
		title,
		playerState,
		getCurrentTime,
		setCurrentTime,
		seekFrameForward,
		seekFrameBackward,
	} = useYoutubePlayer();
	const {
		scriptRef,
		handleLoadCustomScript,
		handleSaveScript,
		handleResetScript,
		handleAddKeyframe,
		handleRemoveKeyframe,
		handleUpdateKeyframe,
	} = useScript();
	const { currentKeyframe, currentKeyframeIndex, currentRGB, currentTime, start, stop } =
		useLightEngine({
			scriptRef,
			getCurrentTime,
		});

	useEffect(() => {
		start();
	}, [start]);

	useEffect(() => {
		return () => stop();
	}, [stop]);

	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (currentTime == null) return;

			if (e.key === 'a' || e.key === 'l') {
				handleAddKeyframe(currentTime);
			} else if (e.key === ',') {
				seekFrameBackward();
			} else if (e.key === '.') {
				seekFrameForward();
			}
		};

		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	}, [currentTime, handleAddKeyframe, seekFrameBackward, seekFrameForward]);

	const [colorHelper, setColorHelper] = useState('#000000');
	function scaleBrightness(hex, brightness) {
		// brightness: 0.0 → 1.0
		hex = hex.replace(/^#/, '');
		if (hex.length === 3) {
			hex = hex
				.split('')
				.map((c) => c + c)
				.join('');
		}

		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);

		const scale = (x) =>
			Math.round(x * brightness)
				.toString(16)
				.padStart(2, '0');

		return '#' + scale(r) + scale(g) + scale(b);
	}

	return (
		<main style={{ display: 'flex', gap: 24, padding: 24 }}>
			<section>
				<section>
					<div>{title}</div>
					<div id={YT_IFRAME_ID} />
				</section>

				<section style={{ display: 'flex', gap: 4 }}>
					<button onClick={handleSaveScript}>Save Script</button>
					<input
						style={{ display: 'none' }}
						id="script-upload"
						type="file"
						accept=".json"
						onChange={handleLoadCustomScript}
					/>
					<label htmlFor="script-upload" className="btn secondary text-center">
						Upload Script
					</label>
					<button onClick={handleResetScript}>Reset Script</button>
				</section>

				{currentKeyframe != null && currentKeyframeIndex != null && currentRGB != null && (
					<section
						style={{
							backgroundColor: `rgb(${currentRGB.r}, ${currentRGB.g}, ${currentRGB.b})`,
							padding: 16,
							marginTop: 16,
						}}
					>
						<div>{currentKeyframeIndex + 1}</div>
						<div>{currentKeyframe.mode}</div>
						<div>{currentKeyframe.time}</div>
						<div>
							({currentRGB.r},{currentRGB.g},{currentRGB.b})
						</div>
					</section>
				)}
			</section>

			{currentTime != null && (
				<section style={{ flexGrow: 1 }}>
					<section>
						<div>Current Time: {currentTime.toFixed(4)}</div>
						<div>
							<span>Color helper</span>
							<div>
								<input
									type="color"
									value={colorHelper}
									onChange={(e) => setColorHelper(e.target.value)}
								/>
								{colorHelper}
							</div>
							<div>
								<input
									type="color"
									defaultValue={scaleBrightness(colorHelper, 0.1)}
								/>
								{scaleBrightness(colorHelper, 0.1)}
							</div>
						</div>

						{currentKeyframe != null && (
							<>
								<br />

								<h4>Current Keyframe Detail</h4>
								<Keyframe
									kf={currentKeyframe}
									disabled={playerState === 1} // 1: YT.PlayerState.PLAYING
									onUpdate={(newKeyframe) => {
										handleUpdateKeyframe(newKeyframe);
										setCurrentTime(newKeyframe.time);
									}}
									onDelete={handleRemoveKeyframe}
								/>
							</>
						)}
					</section>
				</section>
			)}
		</main>
	);
}
