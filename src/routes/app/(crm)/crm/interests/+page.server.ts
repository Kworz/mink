import { Collections, type CrmInterestResponse } from "$lib/DBTypes";
import { ClientResponseError } from "pocketbase";
import type { Actions, PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {

    try
    {
        const interests = await locals.pb.collection(Collections.CrmInterest).getFullList<CrmInterestResponse>();

        return { interests: structuredClone(interests) };
    }
    catch(ex)
    {
        throw redirect(303, "/app/crm");
    }

}) satisfies PageServerLoad;


export const actions: Actions = {
    createInterest: async ({ locals, request }) => {

        const form = await request.formData();

        try
        {
            const interest = await locals.pb.collection(Collections.CrmInterest).create(form);

            return { createInterest: { success: structuredClone(interest) }};
        }
        catch(ex)
        {
            return { createInterest: { error: (ex instanceof ClientResponseError) ? ex.message : ex }}
        }
    },
    editInterest: async ({ locals, request }) => {
        const form = await request.formData();

        try
        {
            const id = form.get("id");

            if(id === null)
                throw "Missing id";

            await locals.pb.collection(Collections.CrmInterest).update(id.toString(), form);

            return { editInterest: { success: true }};

        }
        catch(ex)
        {
            return { editInterest: { error: (ex instanceof ClientResponseError) ? ex.message : ex }}
        }
    },
    deleteInterest: async ({ locals, request }) => {

        const form = await request.formData();

        try
        {
            const id = form.get("id");

            if(id === null)
                throw "Missing id";
            
            await locals.pb.collection(Collections.CrmInterest).delete(id.toString());

            return { deleteInterest: { success: true }};

        }
        catch(ex)
        {
            return { deleteInterest: { error: (ex instanceof ClientResponseError) ? ex.message : ex }}
        }
    }
}