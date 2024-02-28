import type { LayoutServerLoad } from "./$types";

export const ssr = true;

export const load = (async ({ locals }) => {

    const inboundSuppliesCount = await locals.prisma.scm_order_rows.count({ where: { order: { state: { in: ["acknowledged"] }}, received_quantity: { lt: locals.prisma.scm_order_rows.fields.needed_quantity } }});

    return { 
        session: locals.session,
        user: locals.user,
        appSettings: locals.appSettings,
        inboundSuppliesCount 
    }
    
}) satisfies LayoutServerLoad;