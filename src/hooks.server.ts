import type { Handle } from '@sveltejs/kit';
import { auth } from "$lib/server/lucia";
import { prisma } from "$lib/server/prisma";

export const handle = (async ({ event, resolve }) => {

    event.locals.prisma = prisma;
    event.locals.lucia = auth(event.locals.prisma).handleRequest(event);
    event.locals.session = await event.locals.lucia.validate();
    
    if(event.route.id?.startsWith("/app") && event.locals.session === null)
    {
        const target = event.url.pathname === "/app" ? "" : `?target=${btoa(event.url.pathname)}`;
        return new Response(null, {status: 303, headers: { 'location': `/login${target}` }});
    }
    else if((event.route.id?.startsWith("/login") || event.route.id?.startsWith("/register")) && event.locals.session !== null)
    {
        return new Response(null, {status: 303, headers: { 'location': `/app` }});
    }
    else
    {
        const response = await resolve(event);
        return response;
    }

}) satisfies Handle;