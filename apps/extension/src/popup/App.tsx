import '@dl_sean/ado-light-show-common/src/global.css';

import useSession from '@/popup/hook/useSession';
import useScript from '@/popup/hook/useScript';
import { SCRIPT_SOURCES } from '@/utility/constant';
import type { ScriptSource } from '@/utility/type';
import useTab from '@/popup/hook/useTab';

export default function App() {
	const { isActive: isActiveTab } = useTab();

	const {
		status: sessionStatus,
		name: sessionName,
		deviceName,
		handleInitiateSession,
		handleStopSession,
	} = useSession();
	const isSessionActive = sessionStatus === 'ACTIVATED';

	const {
		source: scriptSource,
		name: scriptName,
		handleUpdateScriptSource,
		handleCustomScriptUpload,
	} = useScript();

	return (
		<div className="flex-column" style={{ gap: '1rem', padding: '0.5rem' }}>
			{!isActiveTab && isSessionActive && (
				<div className="marquee">
					<span className="marquee-content">Device is connected on a different tab</span>
					<span className="marquee-content">Device is connected on a different tab</span>
				</div>
			)}

			{isActiveTab && isSessionActive && (
				<div className="marquee">
					<span className="marquee-content">{sessionName}</span>
					<span className="marquee-content">{sessionName}</span>
				</div>
			)}

			<section className="flex-column">
				<h2>Device</h2>

				<div className="row">
					<label>Status</label>
					<span className="flex items-center">
						<span className={`dot ${isSessionActive ? 'on' : 'off'}`} />
						<span>{isSessionActive ? 'Connected' : 'Disconnected'}</span>
					</span>
				</div>

				{isSessionActive && (
					<div className="row">
						<label>Name</label>
						<span>{deviceName}</span>
					</div>
				)}

				<button
					className={`btn ${isSessionActive ? 'accent' : 'primary'}`}
					onClick={() => {
						if (isSessionActive) {
							handleStopSession();
						} else {
							handleInitiateSession();
						}
					}}
				>
					{isSessionActive ? 'Disable Light Show' : 'Enable Light Show'}
				</button>
			</section>

			<section className="flex-column">
				<h2>Script</h2>

				<div className="row">
					<label>Source</label>

					<select
						value={scriptSource}
						onChange={(e) => handleUpdateScriptSource(e.target.value as ScriptSource)}
					>
						{SCRIPT_SOURCES.map((source) => (
							<option key={source} value={source}>
								{source}
							</option>
						))}
					</select>
				</div>

				{scriptName != null && (
					<div className="row">
						<label>Name</label>
						<span>{scriptName}</span>
					</div>
				)}
				{scriptName == null && scriptSource === 'REMOTE' && (
					<div className="row">
						<span>No script found</span>
					</div>
				)}

				{scriptSource === 'CUSTOM' && (
					<div className="flex">
						<input
							style={{ display: 'none' }}
							id="script-upload"
							type="file"
							accept=".json"
							onChange={handleCustomScriptUpload}
						/>
						<label htmlFor="script-upload" className="btn secondary text-center">
							Upload Script
						</label>
					</div>
				)}
			</section>
		</div>
	);
}
