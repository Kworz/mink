import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    addCompanyDetails: async ({ locals, request }) => {
        const form = await request.formData();

        try {
            const companyName = form.get("company_name")?.toString();

            const companyAddressRoad = form.get("company_road")?.toString();
            const companyAddressPostalCode = form.get("company_postal_code")?.toString();
            const companyAddressCity = form.get("company_city")?.toString();
            const companyAddressCountry = form.get("company_country")?.toString();
            
            const companyDefaultVat = form.get("company_default_vat")?.toString();

            if (companyName === undefined || 
                companyAddressRoad === undefined ||
                companyAddressPostalCode === undefined ||
                companyAddressCity === undefined ||
                companyAddressCountry === undefined ||
                companyDefaultVat === undefined
            )
                throw new Error("Missing required fields");

            if (companyName?.length < 3)
                throw new Error("Company name must be at least 3 characters long");

            await locals.prisma.app_settings.createMany({
                data: [
                    { key: "company_name", value: companyName },
                    { key: "company_address_road", value: companyAddressRoad },
                    { key: "company_address_postal_code", value: companyAddressPostalCode },
                    { key: "company_address_city", value: companyAddressCity },
                    { key: "company_address_country", value: companyAddressCountry },
                    { key: "company_default_vat", value: companyDefaultVat },
                ]
            });
        }
        catch(ex)
        {
            console.log(ex);
            return fail(400, { error: ex as string });
        }

        throw redirect(303, "/install/setup-finished");
    }
}