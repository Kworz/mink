import type { PageServerLoad } from "./$types";

export const load = (async ({ locals, url }) => {

    const sort = url.searchParams.get("sort") ?? "-created";
    const filter = url.searchParams.get("filter") ?? "";
    const page = Number(url.searchParams.get("page")) ?? 1;

    const leads = await locals.prisma.crm_leads.findMany({ include: { interests: { include: { interest: true }}, company: true, contacts: { include: { contact: true }}}});

    return { 
        leads
    }

}) satisfies PageServerLoad;