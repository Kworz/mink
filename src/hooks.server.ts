import type { Handle } from '@sveltejs/kit';
import { auth } from "$lib/server/lucia";
import { prisma } from "$lib/server/prisma";
import { getSettings } from '$lib/server/settings';
import { s3Client } from '$lib/server/s3';

export const handle = (async ({ event, resolve }) => {

    // locals hydration
    event.locals.prisma = prisma;
    event.locals.s3 = s3Client;
    event.locals.lucia = auth(event.locals.prisma).handleRequest(event);
    event.locals.session = await event.locals.lucia.validate();

    const appSettings = getSettings(await event.locals.prisma.app_settings.findMany());

    // Handles install redirect
    if(appSettings === undefined && !event.route.id?.startsWith("/install"))
        return new Response(null, {status: 303, headers: { 'location': `/install` }});
    else if(appSettings !== undefined && event.route.id?.startsWith("/install"))
        return new Response(null, {status: 303, headers: { 'location': `/app` }});

    event.locals.appSettings = appSettings;
    
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