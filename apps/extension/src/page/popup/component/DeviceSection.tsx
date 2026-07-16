import useDeviceTab from '@/page/popup/hook/useDeviceTab';

const DeviceSection = () => {
	const { deviceCount, handleTabFocus } = useDeviceTab();

	return (
		<section className="flex-column">
			<h2>Device</h2>

			<div className="row">
				<label>Status</label>
				<span className="flex items-center">
					<span className={`dot ${deviceCount > 0 ? 'on' : 'off'}`} />
					<span>{`Connected: ${deviceCount}`}</span>
				</span>
			</div>

			<div className="row">
				<button className="btn primary" onClick={handleTabFocus}>
					Penlight Manager
				</button>
			</div>
		</section>
	);
};

export default DeviceSection;
