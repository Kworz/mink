import { env } from "$env/dynamic/private";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "../bank-link/$types";

export const load = (async ({ params, locals }) => {


}) satisfies PageServerLoad;


export const actions = {

    addBank: async ({ locals }) => {

        if(locals.appSettings?.app_bridgeapi_user_uuid === null)
        {
            const register = await fetch("https://api.bridgeapi.io/v2/users", {
                headers: {
                    "Bridge-Version": "2021-06-01",
                    "Content-Type": "application/json",
                    "Client-Id": env.BRIDGEAPI_CLIENTID,
                    "Client-Secret": env.BRIDGEAPI_CLIENTSECRET,
                },
                method: "post",
            });

            const { uuid } = await register.json() as BridgeApiUserCreateResponse;

            if(register.ok && register.status === 201)
            {
                await locals.prisma.app_settings.create({ data: { key: "app_bridgeapi_user_uuid", value: uuid } });
            }

        }


        const auth = await fetch("https://api.bridgeapi.io/v2/authenticate", {
            headers: {
                "Bridge-Version": "2021-06-01",
                "Content-Type": "application/json",
                "Client-Id": env.BRIDGEAPI_CLIENTID,
                "Client-Secret": env.BRIDGEAPI_CLIENTSECRET,
            },
            method: "post",
            body: JSON.stringify({
                external_user_id: userId
            })
        });

        const authBody = await auth.json() as BridgeApiAuthReponse;

        console.log(authBody);

        const { access_token: token } = authBody;

        const syncBank = await fetch("https://api.bridgeapi.io/v2/connect/items/add", {
            headers: {
                "Bridge-Version": "2021-06-01",
                "Content-Type": "application/json",
                "Client-Id": env.BRIDGEAPI_CLIENTID,
                "Client-Secret": env.BRIDGEAPI_CLIENTSECRET,
                "Authorization": `Bearer ${token}`
            },
            method: "post",
            body: JSON.stringify({
                country: "fr",
                prefill_email: locals.user?.email,
            })
        });

        const syncBankBody = await syncBank.json();

        if("redirect_url" in syncBankBody)
            return redirect(302, syncBankBody.redirect_url);
        else
            return fail(400, { addBank: { error: "errors.app.generic" }});
    }

} satisfies Actions;

type BridgeApiUserCreateResponse = {
    uuid: string
};

type BridgeApiAuthReponse = {
    access_token: string;
    expires_at: string;
    user: {
        uuid: string;
        external_user_id: string;
    }
}