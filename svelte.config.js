import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: [
        vitePreprocess(),
        preprocess({ postcss: true }),
    ],

    kit: {
        adapter: adapter({
            out: "build",
        }),
    },
};

export default config;
