import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
	ssr:{
		noExternal: ["@fontsource/inter", 'three']
	},
	server: {
		hmr: {
			host: "localhost"
		}
	}
};

export default config;