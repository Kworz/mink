import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
	ssr:{
		noExternal: ["@fontsource/inter", 'three', 'troika-three-text']
	},
	server: {
		hmr: {
			host: "localhost"
		}
	}
};

export default config;