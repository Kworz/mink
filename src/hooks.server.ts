import type { Handle } from '@sveltejs/kit';
import { PrismaClient } from "@prisma/client";
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
        const target = event.url.pathname === "/app" ? "" : `?target=${btoa(event.url.pathname)}`;
        return new Response(null, {status: 303, headers: { 'location': `/login${target}` }});
    }
    else if((event.route.id?.startsWith("/login") || event.route.id?.startsWith("/register")) && event.locals.user !== undefined)
    {
        return new Response(null, {status: 303, headers: { 'location': `/app` }});
    }
    else
    {
        const response = await resolve(event);
        return response;
    }

}) satisfies Handle;