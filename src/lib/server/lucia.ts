import { lucia } from "lucia";
import { sveltekit } from "lucia/middleware";
import { prisma } from "@lucia-auth/adapter-prisma";
import { dev } from "$app/environment";
import type { PrismaClient } from "@prisma/client";

export const auth = (prismaClient: PrismaClient) => {
    return lucia({
        adapter: prisma(prismaClient),
        env: dev ? "DEV" : "PROD",
        middleware: sveltekit(),
    
        getUserAttributes: (data) => {
            return {
                username: data.username
            }
        }
    });
}
    
export type Auth = typeof auth;