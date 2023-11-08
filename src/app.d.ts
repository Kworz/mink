/// <reference types="@sveltejs/kit" />
/// <reference types="lucia" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

import type PocketBase, { BaseAuthStore } from "pocketbase";
import type { PrismaClient } from "@prisma/client";

declare global {
	namespace App {
		// interface Error {}
	
		interface Locals {
			pb: PocketBase
			prisma: PrismaClient
			auth: import('lucia').AuthRequest
			user: BaseAuthStore["model"] | undefined
		}
	
		interface PageData {
			user: BaseAuthStore["model"] | undefined,
			pb: PocketBase
		}
	
		// interface Platform {}
	}
	namespace Lucia {
		type Auth = import("$lib/server/lucia").Auth;
		type DatabaseUserAttributes = {
			username: string;
			email: string;
		};
		type DatabaseSessionAttributes = {};
	}
}

export {};