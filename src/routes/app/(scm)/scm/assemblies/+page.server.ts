import { type AssembliesResponse, Collections } from "$lib/DBTypes";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { ClientResponseError } from "pocketbase";

export const load = (async ({ locals, url }) => {

    const filter = url.searchParams.get("filter") || "";

    const assemblies = await locals.prisma.sCMAssembly.findMany();

    return {
        assemblies,
    }

}) satisfies PageServerLoad;

export const actions: Actions = {
    createAssembly: async ({ locals, request }) => {
        const form = await request.formData();

        let createAssemblyID = "";

        try {

            const name = form.get("name")?.toString();

            if (!name) {
                throw new Error("Name is required");
            }

            const { id } = await locals.prisma.sCMAssembly.create({
                data: {
                    name
                }
            });

            createAssemblyID = id;
        }
        catch (ex) {
            return { createAssembly: { error: (ex instanceof ClientResponseError ? ex.message : ex) } };
        }

        throw redirect(303, `/app/scm/assemblies/${createAssemblyID}`);
    }
}