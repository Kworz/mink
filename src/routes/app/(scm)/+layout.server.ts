import type { LayoutServerLoad } from "./$types";

export const ssr = true;

export const load = (async ({ locals }) => {

    const approxCount = await locals.prisma.scm_order_rows.count({ where: { order: { state: { in: ["acknowledged"] }}, received_quantity: { lt: locals.prisma.scm_order_rows.fields.needed_quantity } }});

    return { 
        session: locals.session,
        appSettings: locals.appSettings,
        approxCount
    }
    
}) satisfies LayoutServerLoad;