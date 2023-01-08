import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
	ssr:{
		noExternal: ["@fontsource/inter"]
	}
};

export default config;
