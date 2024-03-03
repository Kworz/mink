import type { Handle } from '@sveltejs/kit';
import type { PrismaClient } from '@prisma/client';
import { lucia } from "$lib/server/lucia";
import { prisma } from "$lib/server/prisma";
import { getSettings, getUserSettings } from '$lib/server/settings';
import { getS3Client } from '$lib/server/s3';
import { locale } from 'svelte-i18n';
import { hash } from 'argon2';

export const handle = (async ({ event, resolve }) => {

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
        event.locals.user = user;
    }

    // locals hydration
    event.locals.prisma = prisma as unknown as PrismaClient;

    const lang = event.request.headers.get('accept-language')?.split(',')[0];
    if(lang) locale.set(lang);

    const appSettings = getSettings(await event.locals.prisma.app_settings.findMany());

    // Handles install redirect
    if(appSettings === undefined && !event.route.id?.startsWith("/install"))
        return new Response(null, {status: 303, headers: { 'location': `/install` }});
    else if(appSettings !== undefined && event.route.id?.startsWith("/install"))
        return new Response(null, {status: 303, headers: { 'location': `/app` }});
    else if(appSettings === undefined && event.route.id?.startsWith("/install"))
        return await resolve(event);
    else if(appSettings === undefined)
        throw new Error("App settings are undefined");

    event.locals.appSettings = appSettings;

    // set S3 after gettings the settings
    event.locals.s3 = getS3Client(appSettings.app_s3_region);

    if(event.locals.session === null)
    {
        if(event.route.id?.startsWith("/app"))
        {
            const target = event.url.pathname === "/app" ? "" : `?target=${encodeURIComponent(event.url.pathname)}`;
            return new Response(null, {status: 303, headers: { 'location': `/login${target}` }});
        }
        else
            return (await resolve(event));

    }
    else
    {
        // if session is defined get user preferences

        const userSettings = await event.locals.prisma.user_settings.findMany({ where: { user_id: event.locals.user?.id }});
        event.locals.userSettings = getUserSettings(userSettings);
        if(event.locals.userSettings.app_language) locale.set(event.locals.userSettings.app_language);

        if(event.route.id?.startsWith("/login") || event.route.id?.startsWith("/register"))
        {
            return new Response(null, {status: 303, headers: { 'location': `/app` }});
        }
        else
            return (await resolve(event));
    }

}) satisfies Handle;