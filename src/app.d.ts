/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

import type PocketBase, { BaseAuthStore } from "pocketbase";

declare global {
	namespace App {
		// interface Error {}
	
		interface Locals {
			pb: PocketBase
			user: BaseAuthStore["model"] | undefined
		}
	
		interface PageData {
			user: BaseAuthStore["model"] | undefined
		}
	
		// interface Platform {}
	}
}

