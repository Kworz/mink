import { Collections, type StoresResponse } from "$lib/DBTypes";
import { ClientResponseError } from "pocketbase";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {

    const stores = await locals.pb.collection(Collections.Stores).getFullList<StoresResponse>();

    return { 
        stores: structuredClone(stores)
    }

})  satisfies PageServerLoad;

export const actions: Actions = {
    createStore: async ({ locals, request }) => {
        const form = await request.formData();

        try {
            await locals.pb.collection(Collections.Stores).create(form);
        }
        catch(e)
        {
            return { createStore: { error: (e instanceof ClientResponseError) ? e.message : e }}
        }
    },
    editStore: async ({ locals, request }) => {
        const form = await request.formData();
        const id = form.get("id")?.toString();

        try {
            if(!id)
                throw "No id provided";
            
            await locals.pb.collection(Collections.Stores).update(id, form);
        }
        catch(e)
        {
            return { editStore: { error: (e instanceof ClientResponseError) ? e.message : e }}
        }
    },
    deleteStore: async ({ locals, request }) => {
        const form = await request.formData();
        const id = form.get("id")?.toString();

        try {
            if(!id)
                throw "No id provided";
            await locals.pb.collection(Collections.Stores).delete(id);
        }
        catch(e)
        {
            return { deleteStore: { error: (e instanceof ClientResponseError) ? e.message : e }}
        }
    }
}