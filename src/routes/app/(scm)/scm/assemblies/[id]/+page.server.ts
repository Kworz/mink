import { fail, redirect } from "@sveltejs/kit";
import { deleteFile, saveFile } from "$lib/server/files";
import { articleIncludeQuery } from "$lib/components/derived/article/article";
import type { scm_assembly } from "@prisma/client";
import type { PageServerLoad, Actions } from "./$types";
import type { SCMAssemblyTree } from "$lib/components/derived/assemblies/assemblyTree";

export const load = (async ({ locals, params }) => {

    const assembly = await locals.prisma.scm_assembly.findUniqueOrThrow({ 
        where: { id: params.id }, 
        include: { article_childrens: { include: { article_child: { include: articleIncludeQuery }}}, assembly_childrens: { include: { assembly_child: true }}}
    });

    const assemblies = await locals.prisma.scm_assembly.findMany({ select: { id: true, name: true}, where: { id: { notIn: [params.id, ...assembly.assembly_childrens.map(ac => ac.assembly_child_id)] }}});
    const articles = await locals.prisma.scm_article.findMany({ include: articleIncludeQuery, take: 10, orderBy: { name: "asc" }});

    async function generateAssemblyTree(id: string): Promise<SCMAssemblyTree>
    {
        const assembly = await locals.prisma.scm_assembly.findUniqueOrThrow({ where: { id }, include: { assembly_childrens: true }});
        const subAssemblies = await Promise.all(assembly.assembly_childrens.map(relation => generateAssemblyTree(relation.assembly_child_id))).then();
        return { ...assembly, subAssemblies };
    }

    const assemblyTree = await generateAssemblyTree(params.id);

    return {
        assembly,
        assemblyTree,

        assemblies,
        articles
    };

}) satisfies PageServerLoad;

export const actions: Actions = {
    editAssembly: async ({ locals, request, params }) => {
        try
        {
            const form = await request.formData();

            const name = form.get("name")?.toString();
            const description = form.get("description")?.toString();
            const assembly_time = Number(form.get("assembly_time")?.toString()) ?? 0;

            const thumbnail = form.get("thumbnail") as Blob;

            if(form.has("deleteThumbnail"))
            {
                const assembly = await locals.prisma.scm_assembly.findUniqueOrThrow({ where: { id: params.id }});
                if(assembly.thumbnail !== null)
                {
                    await deleteFile(assembly.thumbnail);    
                    await locals.prisma.scm_assembly.update({ where: { id: params.id }, data: { thumbnail: null }});           
                }
            }

            const query = {} as scm_assembly;

            if(form.has("thumbnail") !== false && thumbnail.size !== 0)
                query.thumbnail = await saveFile("scm/assembly/thumbnails", thumbnail) as string;

            await locals.prisma.scm_assembly.update({ where: { id: params.id }, data: {
                ...query,
                name,
                description,
                assembly_time
            }});

            return { editAssembly: { success: "Successfully updated assembly" }};
        }
        catch(ex)
        {
            console.log(ex);
            return { editAssembly: { error: "failed to update assembly" }};
        }
    },
    copyAssembly: async ({ locals, params, request }) => {

        const form = await request.formData();

        let newAssembly: scm_assembly | null = null;

        try
        {
            const name = form.get("name")?.toString();

            if(name === undefined)
                throw "Name is required";

            const assembly = await locals.prisma.scm_assembly.findUniqueOrThrow({ where: { id: params.id }, include: { article_childrens: true, assembly_childrens: true }});

            newAssembly = await locals.prisma.scm_assembly.create({
                data: {
                    name: name,
                    description: assembly.description,
                    thumbnail: assembly.thumbnail,
                }
            });

            if(newAssembly === null)
                throw "Failed to create copied assembly";
    
            for(const relation of assembly.assembly_childrens)
            {
                await locals.prisma.scm_assembly_relation_sub_assembly.create({ data: { ...relation, id: undefined }});
            }

            for(const relation of assembly.article_childrens)
            {
                await locals.prisma.scm_assembly_relation_article.create({ data: { ...relation, id: undefined }});
            }
        }
        catch(ex)
        {
            return fail(500, { copyAssembly: { error: "Failed to copy assembly" }});
        }

        throw redirect(302, `/app/scm/assemblies/${newAssembly.id}`);
    },
    deleteAssembly: async ({ locals, params }) => {
        try
        {
            await locals.prisma.scm_assembly.delete({ where: { id: params.id }});
        }
        catch(ex)
        {
            return fail(500, { deleteAssembly: { error: "Failed to delete assembly" }});
        }
        throw redirect(302, "/app/scm/assemblies");
    },
    addAssemblySubArticle: async ({ locals, params, request }) => {

        const form = await request.formData();

        try
        {
            const article_id = form.get("child_article_id")?.toString();
            const quantity = form.get("quantity")?.toString();
            const parent_id = params.id;

            if(article_id === undefined || quantity === undefined)
                throw "Article and quantity is required";

            await locals.prisma.scm_assembly_relation_article.create({ data: {

                parent_id,
                article_child_id: article_id,
                quantity: parseInt(quantity)

            }});

            return { addAssemblySubArticle: { success: "Successfully added article to assembly" }};
        }
        catch(ex)
        {
            console.log(ex);
            return fail(500, { addAssemblySubArticle: { error: "Failed to add article to assembly" }});
        }
    },
    addAssemblySubAssembly: async ({ locals, params, request }) => {
            
        const form = await request.formData();

        try
        {
            const assembly_id = form.get("child_assembly_id")?.toString();
            const quantity = form.get("quantity")?.toString();
            const parent_id = params.id;

            if(assembly_id === undefined || quantity === undefined)
                throw "Assembly and quantity is required";

            await locals.prisma.scm_assembly_relation_sub_assembly.create({ data: {

                parent_id,
                assembly_child_id: assembly_id,
                quantity: parseInt(quantity)

            }});

            return { addAssemblySubAssembly: { success: "Successfully added assembly to assembly" }};
        }
        catch(ex)
        {
            console.log(ex);
            return fail(500, { addAssemblySubAssembly: { error: "Failed to add assembly to assembly" }});
        }
    },
    moveRelations: async ({ locals, params, request }) => {
            
            const form = await request.formData();
    
            try
            {
                const newAssemblyName = form.get("name")?.toString();
                const newAssemblyDescription = form.get("description")?.toString();

                const selectedArticleRelations = form.get("selected_article_relations")?.toString();
                const selectedAssemblyRelations = form.get("selected_assemblies_relations")?.toString();

                if(newAssemblyName === undefined || newAssemblyDescription === undefined)
                    throw "Missing arguments";

                if(selectedArticleRelations === undefined || selectedAssemblyRelations === undefined)
                    throw "Missing arguments for selected relations";

                const newAssembly = await locals.prisma.scm_assembly.create({
                    data: {
                        name: newAssemblyName,
                        description: newAssemblyDescription,
                    }
                });

                if(selectedArticleRelations.length > 0)
                {
                    for(const articleRelation of selectedArticleRelations.split(","))
                    {
                        await locals.prisma.scm_assembly_relation_article.update({ where: { id: articleRelation }, data: { parent_id: newAssembly.id }});
                    }
                }

                if(selectedAssemblyRelations.length > 0)
                {
                    for(const assemblyRelation of selectedAssemblyRelations.split(","))
                    {
                        await locals.prisma.scm_assembly_relation_sub_assembly.update({ where: { id: assemblyRelation }, data: { parent_id: newAssembly.id }});
                    }
                }
                
                await locals.prisma.scm_assembly_relation_sub_assembly.create({ data: { parent_id: params.id, assembly_child_id: newAssembly.id, quantity: 1 }});

                return { moveRelations: { success: "Successfully moved articles to new subassembly" }};
            }
            catch(ex)
            {
                console.log(ex);
                return fail(500, { moveRelations: { error: "Failed to move assembly" }});
            }
    
            throw redirect(302, `/app/scm/assemblies/${params.id}`);
    },
    deleteRelation: async ({ locals, request }) => {

        //TODO: Figure out the cascade rule that prevent deletion of relations
        
        const form = await request.formData();

        try
        {
            const articleRelationId = form.get("article_relation_id")?.toString();
            const subAssemblyRelationId = form.get("subassembly_relation_id")?.toString();

            if(articleRelationId !== undefined)
                await locals.prisma.scm_assembly_relation_article.delete({ where: { id: articleRelationId }});
            
            if(subAssemblyRelationId !== undefined)
                await locals.prisma.scm_assembly_relation_sub_assembly.delete({ where: { id: subAssemblyRelationId }});
            
        }
        catch(ex)
        {
            console.error(ex);
            return fail(500, { deleteAssembly: { error: "Failed to delete assembly" }});
        }

        return { deleteRelation: { success: "Successfully deleted relation" }};
    }
}