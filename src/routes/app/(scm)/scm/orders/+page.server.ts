import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import type { scm_order, scm_order_state } from "@prisma/client";

export const load = (async ({ locals, url }) => {

    const showCancelledOrders = url.searchParams.get("show_cancelled") === "true";
    const showCompletedOrders = url.searchParams.get("show_completed") === "true";

    const stateFilter: scm_order_state[] = ["draft", "quotation", "sent", "acknowledged"];

    if(showCancelledOrders) stateFilter.push("cancelled");
    if(showCompletedOrders) stateFilter.push("completed");

    const orders = await locals.prisma.scm_order.findMany({ where: { state: { in: stateFilter }}, include: { order_rows: true, supplier: true, issuer: true }});
    const orderCount = await locals.prisma.scm_order.count();
    const suppliers = await locals.prisma.scm_supplier.findMany();
    
    return {
        orders,
        orderCount,
        suppliers
    };

}) satisfies PageServerLoad;

export const actions: Actions = {
    createOrder: async ({ request, locals }) => {

        let createdOrder: scm_order | undefined = undefined;

        try
        {
            if(locals.session === null)
                throw "app.user.error.no_auth";

            const creationDate = new Date().toISOString().split("T")[0];

            const nextDay = new Date(creationDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const currentDayLastOrder = await locals.prisma.scm_order.findMany({ where: { created: { gte: new Date(creationDate), lt: nextDay }}, orderBy: { created: "desc" }});
            const subId = `${currentDayLastOrder.length+1}-${creationDate?.replaceAll("-", "")}`;
            
            const form = await request.formData();
            form.set("sub_id", subId);
            form.set("issuer_id", locals.session?.user.userId);

            createdOrder = await locals.prisma.scm_order.create({
                data: {
                    ...Object.fromEntries(form.entries()) as unknown as scm_order, 
                    vat: locals.appSettings.company_default_vat
                }
            });
        }
        catch(ex)
        {
            console.log(ex);
            return fail(400, { create: { error: String(ex) }});
        }
        throw redirect(303, `/app/scm/orders/${createdOrder.id}`);
    }
}