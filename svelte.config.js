import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/kit/vite";
import seqPreprocessor from "svelte-sequential-preprocessor";
import { preprocessThrelte } from '@threlte/preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [
    vitePreprocess(),
    seqPreprocessor([preprocess({postcss: true}), preprocessThrelte()])
  ],

  kit: {
    adapter: adapter({
      out: "build",
    }),
  },
};

export default config;
