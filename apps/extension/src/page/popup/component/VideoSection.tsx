import useVideoTab from '@/page/hook/useVideoTab';

const VideoSection = () => {
	const {
		hasVideoTab,
		isVideoTab,
		videoTitle,
		isCurrentTabValid,
		handleTabFocus,
		handleSetTabState,
	} = useVideoTab();

	const isWrongTab = hasVideoTab && !isVideoTab;

	return (
		<>
			{isVideoTab && !!videoTitle && (
				<div className="marquee">
					<span className="marquee-content">🎶 {videoTitle} </span>
					<span className="marquee-content">🎶 {videoTitle} </span>
				</div>
			)}

			<section className="flex-column">
				<h2>Video</h2>

				<div className="row">
					<label>Status</label>
					<span className="flex items-center">
						<span className={`dot ${hasVideoTab ? 'on' : 'off'}`} />
						<span>{hasVideoTab ? 'Connected' : 'Disconnected'}</span>
					</span>
				</div>

				<div className="row">
					<button
						className={`btn ${hasVideoTab ? 'accent' : 'primary'} ${!hasVideoTab && !isCurrentTabValid ? 'disabled' : ''}`}
						onClick={() => handleSetTabState(!hasVideoTab)}
						disabled={!hasVideoTab && !isCurrentTabValid}
					>
						{hasVideoTab
							? 'Disable Light Show'
							: isCurrentTabValid
								? 'Enable Light Show'
								: '⚠️ No Youtube video found '}
					</button>
				</div>

				{isWrongTab && (
					<div className="row">
						<button className="btn secondary" onClick={handleTabFocus}>
							Open synced tab
						</button>
					</div>
				)}
			</section>
		</>
	);
};

export default VideoSection;
