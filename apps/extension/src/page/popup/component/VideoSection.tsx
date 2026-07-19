import Marquee from '@/page/component/Marquee';
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

	return (
		<>
			{hasVideoTab && !!videoTitle && <Marquee value={`🎶 ${videoTitle} `} />}

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

				{hasVideoTab && !isVideoTab && (
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
