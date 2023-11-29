/// <reference types="@sveltejs/kit" />
/// <reference types="lucia" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

import type PocketBase, { BaseAuthStore } from "pocketbase";
import type { PrismaClient } from "@prisma/client";
import type { Auth } from "$lib/server/lucia";
import type { AppSettings } from "$lib/server/settings";

declare global {

	namespace App {
		// interface Error {}
	
		interface Locals {
			prisma: PrismaClient

			lucia: import("lucia").AuthRequest
			session: Awaited<ReturnType<typeof import("lucia").AuthRequest.prototype.validate>>
			appSettings: AppSettings
		}
	
		interface PageData {
			session: Awaited<ReturnType<typeof import("lucia").AuthRequest.prototype.validate>>,
			appSettings: AppSettings
		}
	
		// interface Platform {}
	}

	namespace Lucia
	{
		type Auth = import("$lib/server/lucia").Auth;
		type DatabaseUserAttributes = {
			username: string;
			email: string;
			avatar: string | null;
			created: Date;
			updated: Date;
		};
		type DatabaseSessionAttributes = {};
	}
}

export {};