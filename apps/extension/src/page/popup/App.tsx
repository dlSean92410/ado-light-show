import '@dl_sean/ado-light-show-common/src/global.css';

import ScriptSection from '@/page/component/ScriptSection';
import VideoSection from './component/VideoSection';
import DeviceSection from './component/DeviceSection';

export default function App() {
	return (
		<div className="flex-column" style={{ gap: '1rem', padding: '0.5rem' }}>
			<VideoSection />
			<DeviceSection />
			<ScriptSection />
		</div>
	);
}
