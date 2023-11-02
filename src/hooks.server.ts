import type { Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { PrismaClient } from "@prisma/client";
import { env } from "$env/dynamic/public";
import { auth } from "$lib/server/lucia";

export const handle = (async ({ event, resolve }) => {

    event.locals.prisma = new PrismaClient();
    await event.locals.prisma.$connect();

    event.locals.auth = auth(event.locals.prisma).handleRequest(event);

    const session = await event.locals.auth.validate();
    
    if(session)
        event.locals.user = session.user;
    else
        event.locals.user = undefined;

    if(event.route.id?.startsWith("/app") && event.locals.user === undefined)
    {
        return new Response(null, {status: 303, headers: { 'location': `/auth/login?target=${btoa(event.url.pathname)}` }});
    }
    else
    {
        const response = await resolve(event);
        return response;
    }

}) satisfies Handle;