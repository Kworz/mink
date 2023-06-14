import { Collections, type CrmCompanyResponse, type CrmInterestResponse, type CrmLeadsInterestsResponse, type CrmLeadsResponse } from "$lib/DBTypes";
import type { PageServerLoad } from "./$types";

export type CrmLeadsExpanded = CrmLeadsResponse<{
    "crm_leads_interests(lead)": Array<CrmLeadsInterestsResponse<{
        interest: CrmInterestResponse
    }>>,
    "company": CrmCompanyResponse,
    "company_contacts": Array<CrmCompanyContactResponse>
}>;

export const load = (async ({ locals, url }) => {

    const sort = url.searchParams.get("sort") ?? "-created";
    const filter = url.searchParams.get("filter") ?? "";
    const page = Number(url.searchParams.get("page")) ?? 1;

    const leads = await locals.pb.collection(Collections.CrmLeads).getList<CrmLeadsExpanded>(page, 50, { sort, filter, expand: "crm_leads_interests(lead).interest,company,company_contacts" });

    return { 
        leads: structuredClone(leads)
    }

}) satisfies PageServerLoad;