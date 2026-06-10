import type { ScriptSource } from './type';

const DEVICE_NAME = 'Ado Light Stick';
const SERVICE_UUID = '00000000-0000-1000-8000-00805f9b34fb';

const SCRIPT_SOURCES: [ScriptSource, ScriptSource] = ['CUSTOM', 'REMOTE'];

const REMOTE_SCRIPTS = {
	['l0WArCNh6G0']: {
		name: 'MAGIC',
		url: 'https://gist.githubusercontent.com/ShouShou92410/8cf296f59a5767469c46d89ad7144c2c/raw/eff307523c9096abc666b7b4f8f78aa31c93664f/gistfile1.txt',
	},
	['pgXpM4l_MwI']: {
		name: 'SHOW',
		url: 'https://gist.githubusercontent.com/ShouShou92410/8cf296f59a5767469c46d89ad7144c2c/raw/eff307523c9096abc666b7b4f8f78aa31c93664f/gistfile1.txt',
	},
} as Record<string, { name: string; url: string }>;

export { DEVICE_NAME, SERVICE_UUID, SCRIPT_SOURCES, REMOTE_SCRIPTS };
