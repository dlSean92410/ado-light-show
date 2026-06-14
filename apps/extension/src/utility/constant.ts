import type { ScriptSource } from './type';

const DEVICE_NAME = 'Ado Light Stick';
const SERVICE_UUID = '00000000-0000-1000-8000-00805f9b34fb';

const SCRIPT_SOURCES: [ScriptSource, ScriptSource] = ['CUSTOM', 'REMOTE'];

const REMOTE_SCRIPTS = {
	['l0WArCNh6G0']: {
		name: 'MAGIC',
		url: 'https://gist.githubusercontent.com/ShouShou92410/8cf296f59a5767469c46d89ad7144c2c/raw/abb866fc5bb027fd40ccaadcc251fa130ad07a46/MAGIC.json',
	},
	['pgXpM4l_MwI']: {
		name: '唱',
		url: 'https://gist.githubusercontent.com/ShouShou92410/8cf296f59a5767469c46d89ad7144c2c/raw/abb866fc5bb027fd40ccaadcc251fa130ad07a46/%25E5%2594%25B1.json',
	},
	['aGSmxr-dUq0']: {
		name: 'エンゼルシーク',
		url: 'https://gist.githubusercontent.com/ShouShou92410/8cf296f59a5767469c46d89ad7144c2c/raw/abb866fc5bb027fd40ccaadcc251fa130ad07a46/%25E3%2582%25A8%25E3%2583%25B3%25E3%2582%25BC%25E3%2583%25AB%25E3%2582%25B7%25E3%2583%25BC%25E3%2582%25AF.json',
	},
} as Record<string, { name: string; url: string }>;

export { DEVICE_NAME, SERVICE_UUID, SCRIPT_SOURCES, REMOTE_SCRIPTS };
