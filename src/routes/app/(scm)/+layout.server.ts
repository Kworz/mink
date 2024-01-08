import type { LayoutServerLoad } from "./$types";

export const ssr = true;

export const load = (async ({ locals }) => {

    const approx_count = await locals.prisma.scm_order_rows.count({ where: { order: { state: { in: ["acknowledged", "ordered"] }}, received_quantity: { lt: locals.prisma.scm_order_rows.fields.needed_quantity } }});

    return { 
        session: locals.session,
        appSettings: locals.appSettings,
        approx_count
    }
    
}) satisfies LayoutServerLoad;