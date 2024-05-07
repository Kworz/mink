/// <reference types="@sveltejs/kit" />
/// <reference types="lucia" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

import type { PrismaClient, user } from "@prisma/client";
import type { Auth } from "$lib/server/lucia";
import type { AppSettings, UserSettings } from "$lib/server/settings";
import type { S3Client } from "@aws-sdk/client-s3";
import type { User, Session } from "lucia";
import type { userWithIncludes } from "$lib/components/derived/user/user";

declare global {

	namespace App {

		// interface Error {}
		// interface Platform {}
	
		/** Local data populated by Handle hook */
		interface Locals
		{
			prisma: PrismaClient;
			s3: S3Client;
			
			user: userWithIncludes | null;
			session: Session | null;

			appSettings?: AppSettings;
			userSettings?: UserSettings;
		}
	
		/** Page data populated by layouts load function */
		interface PageData
		{
			user: userWithIncludes | null;
			session: Session | null;
			
			appSettings?: AppSettings
			userSettings?: UserSettings
		}
	}
}

export {};