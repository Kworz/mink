<script context="module" lang="ts">

    export type AssembliesRelationsReponseExpanded = AssembliesRelationsResponse<{
        assembly_child: AssembliesResponse,
        article_child: ArticleResponseExpanded
    }>;

</script>

<script lang="ts">

    import { Collections, type AssembliesRelationsResponse, type AssembliesResponse } from "$lib/DBTypes";
    import { page } from "$app/stores";
    import { Folder } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { onMount } from "svelte";
    import AssemblyButton from "./AssemblyButton.svelte";
    import type { ArticleResponseExpanded } from "../article/ArticleRow.svelte";
    import { afterNavigate } from "$app/navigation";

    export let assembly: AssembliesResponse;
    export let nestLevel = 20;
    export let last = false;

    let childRelations: AssembliesRelationsReponseExpanded[] = [];
    const refreshRelations = async () => childRelations = await $page.data.pb.collection(Collections.AssembliesRelations).getFullList<AssembliesRelationsReponseExpanded>({ filter: `parent="${assembly.id}"`, expand: `assembly_child,article_child.supplier` });

    onMount(async () => {
        await refreshRelations();
    });

    afterNavigate(async () => {
        await refreshRelations();
    });

    $: assembliesChildren = childRelations.filter(cr => cr.assembly_child !== undefined && cr.expand?.assembly_child !== undefined);

</script>

<div class="relative {nestLevel < 20 ? "mt-6" : ""}">

    <AssemblyButton zIndex={nestLevel} id={assembly.id} {last}>
        <Icon src={Folder} class="inline w-5 h-5 mr-2" />
        {assembly.name}
    </AssemblyButton>
    
    {#if assembliesChildren.length > 0}
        {#if nestLevel < 20 && last}
            <div class="absolute w-0.5 -left-6 top-5 bottom-0 bg-white" />
        {/if}
        <div class="ml-12 flex flex-col items-start relative">
            <div class="absolute w-0.5 -left-6 -top-6 bottom-5 bg-zinc-400" />
            {#each assembliesChildren as assembly_child, i}
                <svelte:self assembly={assembly_child.expand?.assembly_child} nestLevel={nestLevel - 1} last={assembliesChildren.length - 1 === i}/>
            {/each}
        </div>
    {/if}
    
</div>
