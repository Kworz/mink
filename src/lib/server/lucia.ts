import { lucia } from "lucia";
import { sveltekit } from "lucia/middleware";
import { prisma } from "@lucia-auth/adapter-prisma";
import { dev } from "$app/environment";
import type { PrismaClient } from "@prisma/client";

export const auth = (prismaClient: PrismaClient) => {
    return lucia({
        adapter: prisma(prismaClient, {
            user: "user",
            session: "auth_session",
            key: "auth_key"
        }),
        env: dev ? "DEV" : "PROD",
        middleware: sveltekit(),
    
        getUserAttributes: (data) => {
            return {
                id: data.id,
                username: data.username,
                email: data.email,
                
                avatar: data.avatar,

                created: data.created,
                updated: data.updated
            }
        }
    });
}
    
export type Auth = ReturnType<typeof auth>;