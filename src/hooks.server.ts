import type { Handle } from '@sveltejs/kit';
import type { PrismaClient } from '@prisma/client';
import { auth } from "$lib/server/lucia";
import { prisma } from "$lib/server/prisma";
import { getSettings, getUserSettings } from '$lib/server/settings';
import { getS3Client } from '$lib/server/s3';
import { locale } from 'svelte-i18n';

export const handle = (async ({ event, resolve }) => {

    // locals hydration
    event.locals.prisma = prisma as unknown as PrismaClient;
    event.locals.lucia = auth(event.locals.prisma).handleRequest(event);
    event.locals.session = await event.locals.lucia.validate();

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
    
    if(event.route.id?.startsWith("/app") && event.locals.session === null)
    {
        const target = event.url.pathname === "/app" ? "" : `?target=${btoa(event.url.pathname)}`;
        return new Response(null, {status: 303, headers: { 'location': `/login${target}` }});
    }
    else if(event.locals.session !== null)
    {
        const userSettings = await event.locals.prisma.user_settings.findMany({ where: { user_id: event.locals.session?.user.id}});

        event.locals.userSettings = getUserSettings(userSettings);

        if(event.locals.userSettings.app_language) locale.set(event.locals.userSettings.app_language);

        if(event.route.id?.startsWith("/login") || event.route.id?.startsWith("/register"))
        {
            return new Response(null, {status: 303, headers: { 'location': `/app` }});
        }
        else
        {
            const response = await resolve(event);
            return response;
        }
    }
    else
        return new Response("Failed to load", { status: 500 });

}) satisfies Handle;