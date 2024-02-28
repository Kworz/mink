import { Lucia, TimeSpan } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "./prisma";
import { dev } from "$app/environment";
import type { user } from "@prisma/client";

const prismaAdapter = new PrismaAdapter(prisma.auth_session, prisma.user);

export const lucia = new Lucia(prismaAdapter, {

    sessionExpiresIn: new TimeSpan(7, "d"),
    sessionCookie: {
        attributes: {
            secure: !dev,
        }
    },

    getUserAttributes: (attributes) => {
        return { ...attributes, hashed_password: undefined };
    } 
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: Omit<user, "hashed_password">;
    }
}

