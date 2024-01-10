/// <reference types="@sveltejs/kit" />
/// <reference types="lucia" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

import type { PrismaClient, auth_session, user } from "@prisma/client";
import type { Auth } from "$lib/server/lucia";
import type { AppSettings } from "$lib/server/settings";
import type { S3Client } from "@aws-sdk/client-s3";

declare global {

	namespace App {
		// interface Error {}
	
		interface Locals {
			prisma: PrismaClient;
			lucia: import("lucia").AuthRequest
			session: Awaited<ReturnType<typeof import("lucia").AuthRequest.prototype.validate>>

			s3: S3Client;

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
		type DatabaseUserAttributes = user;
		type DatabaseSessionAttributes = auth_session;
	}
}

export {};