import { fail, redirect } from "@sveltejs/kit";
import { articleIncludeQuery } from "$lib/components/derived/article/article";
import type { scm_assembly } from "@prisma/client";
import type { PageServerLoad, Actions } from "./$types";
import type { SCMAssemblyTree } from "$lib/components/derived/assemblies/assemblyTree";

export const load = (async ({ locals, params, url }) => {

    const articleFilter = url.searchParams.has("articleFilter") ? JSON.parse(decodeURIComponent(url.searchParams.get("articleFilter") as string)) : undefined;

    const assembly = await locals.prisma.scm_assembly.findUniqueOrThrow({ 
        where: { id: params.id }, 
        include: { article_childrens: { orderBy: { order: "asc" }, include: { article_child: { include: articleIncludeQuery }}}, assembly_childrens: { orderBy: { order: "asc" }, include: { assembly_child: true }}}
    });

    // Get all assemblies that are not the current assembly or any of its children
    // TODO: Check for parent-children relations loops, you can not add an assembly to its own children
    const assemblies = await locals.prisma.scm_assembly.findMany({ where: { id: { notIn: [params.id, ...assembly.assembly_childrens.map(ac => ac.assembly_child_id)] }}});
    const articles = await locals.prisma.scm_article.findMany({ include: articleIncludeQuery, take: 15, where: articleFilter });

    async function generateAssemblyTree(id: string): Promise<SCMAssemblyTree>
    {
        const assembly = await locals.prisma.scm_assembly.findUniqueOrThrow({ where: { id }, include: { assembly_childrens: true }});
        const subAssemblies = await Promise.all(assembly.assembly_childrens.filter(ac => ac.id !== params.id).map(relation => generateAssemblyTree(relation.assembly_child_id))).then();
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
            const assemblyTime = Number(form.get("assembly_time")?.toString()) ?? 0;

            const thumbnail = form.get("thumbnail") as Blob;

            if(form.has("deleteThumbnail"))
            {
                const assembly = await locals.prisma.scm_assembly.findUniqueOrThrow({ where: { id: params.id }});
                if(assembly.thumbnail !== null)
                {
                    await locals.prisma.scm_assembly.update({ where: { id: params.id }, data: { thumbnail: null }});           
                }
            }

            const query = {} as scm_assembly;

            await locals.prisma.scm_assembly.update({ where: { id: params.id }, data: {
                ...query,
                name,
                description,
                assembly_time: assemblyTime
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
            const articleId = form.get("child_article_id")?.toString();
            const parentId = params.id;
            const quantity = Number(form.get("quantity"));

            if(articleId === undefined || quantity === undefined)
                throw "Article and quantity is required";

            if(isNaN(quantity))
                return fail(400, { addAssemblySubArticle: { error: "Article and quantity is not a number" }})

            const lastRelation = await locals.prisma.scm_assembly_relation_article.findFirst({ where: { parent_id: parentId }, orderBy: { order: "desc" }});

            await locals.prisma.scm_assembly_relation_article.create({ data: {

                parent_id: parentId,
                article_child_id: articleId,
                quantity,
                order: (lastRelation?.order !== undefined ? lastRelation.order + 1 : 0),

            }});

            return { addAssemblySubArticle: { success: "Successfully added article to assembly" }};
        }
        catch(ex)
        {
            console.log(ex);
            return fail(500, { addAssemblySubArticle: { error: "Failed to add article to assembly" }});
        }
    },
    updateAssemblySubArticleRelation: async ({ locals, params, request }) => {
        const form = await request.formData();

        const relationId = form.get("relation_id")?.toString();

        if(relationId === undefined)
            return fail(400, { updateAssemblySubArticleRelation: { error: "Relation id is required" }});

        const quantity = Number(form.get("quantity")?.toString());

        if(isNaN(quantity))
            return fail(400, { updateAssemblySubArticleRelation: { error: "Article and quantity is required" }});

        try
        {
            await locals.prisma.scm_assembly_relation_article.update({ where: { id: relationId }, data: {
                quantity
            }});

            return { updateAssemblySubArticleRelation: { success: "Successfully updated article relation" }};
        }
        catch(ex)
        {
            console.log(ex);
            return fail(500, { updateAssemblySubArticleRelation: { error: "Failed to update article relation" }});
        }
    },
    updateAssemblySubArticleRelationOrder: async ({ locals, params, request }) => {

        const form = await request.formData();

        const order = Number(form.get("order")?.toString());

        if(isNaN(order))
            return fail(400, { updateAssemblySubArticleRelationOrder: { error: "Order is required" }});

        const direction = form.get("direction")?.toString();
        
        if(direction !== undefined && !(["up", "down"].includes(direction)))
            return fail(400, { updateAssemblySubArticleRelationOrder: { error: "Direction is required" }});
    
        const newOrder = direction === "up" ? order - 1 : order + 1;

        const existingRelations = await locals.prisma.scm_assembly_relation_article.findMany({ where: { parent_id: params.id }, orderBy: { order: "asc" }});

        const relationToLower = existingRelations.find(r => r.order === newOrder);
        const relationToRaise = existingRelations.find(r => r.order === order);

        if(relationToLower === undefined || relationToRaise === undefined)
            return fail(400, { updateAssemblySubArticleRelationOrder: { error: "Relation not found" }});

        await locals.prisma.scm_assembly_relation_article.updateMany({ where: { id: relationToLower.id }, data: { order: order }});
        await locals.prisma.scm_assembly_relation_article.updateMany({ where: { id: relationToRaise.id }, data: { order: newOrder }});

        return { updateAssemblySubArticleRelationOrder: { success: "Successfully updated article relation order" }};

    },
    updateAssemblySubAssemblyRelation: async ({ locals, params, request }) => {

        const form = await request.formData();

        const relationId = form.get("relation_id")?.toString();

        if(relationId === undefined)
            return fail(400, { updateAssemblySubAssemblyRelation: { error: "Relation id is required" }});

        const quantity = Number(form.get("quantity")?.toString());

        if(isNaN(quantity))
            return fail(400, { updateAssemblySubAssemblyRelation: { error: "Article and quantity is required" }});

        try
        {
            await locals.prisma.scm_assembly_relation_sub_assembly.update({ where: { id: relationId }, data: {
                quantity
            }});

            return { updateAssemblySubAssemblyRelation: { success: "Successfully updated assembly relation" }};
        }
        catch(ex)
        {
            console.log(ex);
            return fail(500, { updateAssemblySubAssemblyRelation: { error: "Failed to update assembly relation" }});
        }
    },
    updateAssemblySubAssemblyRelationOrder: async ({ locals, params, request }) => {

        const form = await request.formData();

        const order = Number(form.get("order")?.toString());

        if(isNaN(order))
            return fail(400, { updateAssemblySubAssemblyRelationOrder: { error: "Order is required" }});

        const direction = form.get("direction")?.toString();
        
        if(direction !== undefined && !(["up", "down"].includes(direction)))
            return fail(400, { updateAssemblySubAssemblyRelationOrder: { error: "Direction is required" }});
    
        const newOrder = direction === "up" ? order - 1 : order + 1;

        const existingRelations = await locals.prisma.scm_assembly_relation_sub_assembly.findMany({ where: { parent_id: params.id }, orderBy: { order: "asc" }});

        const relationToLower = existingRelations.find(r => r.order === newOrder);
        const relationToRaise = existingRelations.find(r => r.order === order);

        if(relationToLower === undefined || relationToRaise === undefined)
            return fail(400, { updateAssemblySubAssemblyRelationOrder: { error: "Relation not found" }});

        await locals.prisma.scm_assembly_relation_sub_assembly.updateMany({ where: { id: relationToLower.id }, data: { order: order }});
        await locals.prisma.scm_assembly_relation_sub_assembly.updateMany({ where: { id: relationToRaise.id }, data: { order: newOrder }});

        return { updateAssemblySubAssemblyRelationOrder: { success: "Successfully updated assembly relation order" }};

    },
    addAssemblySubAssembly: async ({ locals, params, request }) => {
            
        const form = await request.formData();

        try
        {
            const assemblyId = form.get("child_assembly_id")?.toString();
            const parentId = params.id;
            const quantity = form.get("quantity")?.toString();

            if(assemblyId === undefined || quantity === undefined)
                throw "Assembly and quantity is required";

            const lastRelation = await locals.prisma.scm_assembly_relation_sub_assembly.findFirst({ where: { parent_id: parentId }, orderBy: { order: "desc" }});

            await locals.prisma.scm_assembly_relation_sub_assembly.create({ data: {

                parent_id: parentId,
                assembly_child_id: assemblyId,
                quantity: parseInt(quantity),
                order: (lastRelation?.order !== undefined ? lastRelation.order + 1 : 0),

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
    },
    deleteRelation: async ({ locals, request }) => {
        
        const form = await request.formData();

        try
        {
            const articleRelationId = form.get("article_relation_id")?.toString();
            const subAssemblyRelationId = form.get("subassembly_relation_id")?.toString();

            if(articleRelationId !== undefined)
            {
                await locals.prisma.scm_assembly_relation_article.delete({ where: { id: articleRelationId }});
                return { deleteRelation: { success: "Successfully deleted relation" }};
            }
                
            if(subAssemblyRelationId !== undefined)
            {
                await locals.prisma.scm_assembly_relation_sub_assembly.delete({ where: { id: subAssemblyRelationId }});
                return { deleteRelation: { success: "Successfully deleted relation" }};
            }
            
        }
        catch(ex)
        {
            console.error(ex);
            return fail(500, { deleteAssembly: { error: "Failed to delete assembly" }});
        }
    }
}