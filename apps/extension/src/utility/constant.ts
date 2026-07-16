import type { ScriptSource } from './type';

const DEVICE_NAME = 'Ado Light Stick';
const SERVICE_UUID = '00000000-0000-1000-8000-00805f9b34fb';
const PENLIGHT_MANAGER_PATH = 'src/page/penlight-manager/index.html';

const REMOTE_SCRIPT_BASE_URL =
	'https://raw.githubusercontent.com/dlSean92410/ado-light-show/main/scripts';
const SCRIPT_SOURCES: [ScriptSource, ScriptSource] = ['CUSTOM', 'REMOTE'];

export { DEVICE_NAME, SERVICE_UUID, PENLIGHT_MANAGER_PATH, REMOTE_SCRIPT_BASE_URL, SCRIPT_SOURCES };
