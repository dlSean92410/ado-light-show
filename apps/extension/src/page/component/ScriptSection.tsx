import { SCRIPT_SOURCES } from '@/utility/constant';
import type { ScriptSource } from '@/utility/type';
import useScript from '@/page/hook/useScript';

const ScriptSection = () => {
	const {
		source: scriptSource,
		name: scriptName,
		handleUpdateScriptSource,
		handleCustomScriptUpload,
	} = useScript();

	return (
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
	);
};

export default ScriptSection;
