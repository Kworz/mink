import type { Handle } from '@sveltejs/kit';
import { lucia } from "$lib/server/lucia";
import { prisma } from "$lib/server/prisma";
import { getSettings, getUserSettings } from '$lib/server/settings';
import { getS3Client } from '$lib/server/s3';
import { locale } from 'svelte-i18n';
import { isEnvironementValid } from '$lib/server/environment';
import { validateRoute } from '$lib/server/permission';

export const handle = (async ({ event, resolve }) => {

    const lang = event.request.headers.get('accept-language')?.split(',')[0];
    if(lang) locale.set(lang);

    if(event.route.id?.startsWith("/error"))
        return await resolve(event); 

    if(!isEnvironementValid())
        return new Response(null, { status: 303, headers: { 'Location': `/error?error=${encodeURIComponent(JSON.stringify({ error: "Environment invalid", message: "Missing environment variables" }))}` }});

    // locals hydration
    event.locals.prisma = prisma;

    const sessionId = event.cookies.get(lucia.sessionCookieName);

    if(!sessionId)
        event.locals.session = null;
    else
    {
        const { session, user } = await lucia.validateSession(sessionId); 
        if(session && session.fresh)
        {
            const sessionCookie = lucia.createSessionCookie(session.id);
            event.cookies.set(sessionCookie.name, sessionCookie.value, { path: '.', ...sessionCookie.attributes });
        }
        if(!session)
        {
            const sessionCookie = lucia.createBlankSessionCookie();
            event.cookies.set(sessionCookie.name, sessionCookie.value, { path: '.', ...sessionCookie.attributes });
        }
        event.locals.session = session;
        event.locals.user = await event.locals.prisma.user.findUniqueOrThrow({ where: { id: user?.id }, include: { group: true }});
    }

    const appSettings = getSettings(await event.locals.prisma.app_settings.findMany());

    if(appSettings === undefined)
    {
        if(event.route.id?.startsWith("/app"))
            return new Response(null, { status: 303, headers: { 'Location': '/install' }});
        else
            return await resolve(event);
    }
    else if(event.route.id?.startsWith("/install"))
        return new Response(null, { status: 303, headers: { 'Location': '/app' }});

    event.locals.appSettings = appSettings;

    // set S3 after gettings the settings
    event.locals.s3 = getS3Client();

    if(event.locals.session === null)
    {
        if(event.route.id?.startsWith("/app"))
        {
            const target = event.url.pathname === "/app" ? "" : `?target=${encodeURIComponent(event.url.pathname)}`;
            return new Response(null, {status: 303, headers: { 'Location': `/login${target}` }});
        }
        else
            return await resolve(event);
    }
    else
    {
        // if session is defined get user preferences
        const userSettings = await event.locals.prisma.user_settings.findMany({ where: { user_id: event.locals.user?.id }});
        event.locals.userSettings = getUserSettings(userSettings);
        if(event.locals.userSettings.app_language) locale.set(event.locals.userSettings.app_language);

        if(event.route.id?.startsWith("/login") || event.route.id?.startsWith("/register"))
        {
            return new Response(null, { status: 303, headers: { 'location': `/app` }});
        }
        else
        {    
            console.log(event.route, event.url);
            if(event.route.id === null || !validateRoute(event.route.id, event.locals.user))
            {
                return new Response(null, { status: 303, headers: { 'Location': `/error?error=${encodeURIComponent(JSON.stringify({ error: "Permission denied", message: "You don't have enough permission to access this ressource" }))}` }});
            }

            return await resolve(event);
        }
    }
}) satisfies Handle;