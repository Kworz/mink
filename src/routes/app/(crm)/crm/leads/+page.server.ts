import { Collections, type CrmCompanyResponse, type CrmInterestResponse, type CrmLeadsInterestsResponse, type CrmLeadsResponse } from "$lib/DBTypes";
import type { PageServerLoad } from "./$types";

export type CrmLeadsExpanded = CrmLeadsResponse<{
    "crm_leads_interests(lead)": Array<CrmLeadsInterestsResponse<{
        interest: CrmInterestResponse
    }>>,
    "company": CrmCompanyResponse
}>;

export const load = (async ({ locals }) => {

    const leads = await locals.pb.collection(Collections.CrmLeads).getFullList<CrmLeadsExpanded>({ expand: "crm_leads_interests(lead).interest,company" });

    return { 
        leads: structuredClone(leads)
    }

}) satisfies PageServerLoad;