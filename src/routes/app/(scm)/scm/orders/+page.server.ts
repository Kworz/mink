import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import type { scm_order } from "@prisma/client";

export const load = (async ({ locals }) => {

    const orders = await locals.prisma.scm_order.findMany({ include: { order_rows: true, supplier: true, issuer: true }});
    const suppliers = await locals.prisma.scm_supplier.findMany();
    
    return {
        orders: orders,
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
                    vat: locals.appSettings.appCompanyDefaultVat
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