interface Props {
	deviceCount: number;
}
const DeviceSection = ({ deviceCount }: Props) => {
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
		</section>
	);
};

export default DeviceSection;
