interface Props {
	value: string;
}
const Marquee = ({ value }: Props) => {
	return (
		<div className="marquee">
			<span className="marquee-content">{value}</span>
			<span className="marquee-content">{value}</span>
		</div>
	);
};

export default Marquee;
