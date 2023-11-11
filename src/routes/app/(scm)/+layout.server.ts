import type { LayoutServerLoad } from "./$types";

export const ssr = true;

export const load = (async ({ locals }) => {

    const approx_count = await locals.prisma.sCMOrderRows.count({ where: { order: { state: { in: ["acknowledged", "ordered"] }}, received_quantity: { lt: locals.prisma.sCMOrderRows.fields.needed_quantity } }});

    console.log(approx_count);

    return { 
        session: locals.session,
        appSettings: locals.appSettings,
        approx_count
    }
    
}) satisfies LayoutServerLoad;