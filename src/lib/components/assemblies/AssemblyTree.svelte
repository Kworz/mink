<script context="module" lang="ts">

    export type AssembliesRelationsReponseExpanded = AssembliesRelationsResponse<{
        assembly_child: AssembliesResponse,
        article_child: ArticleResponseExpanded
    }>;

</script>

<script lang="ts">

    import { page } from "$app/stores";
    import { Collections, type AssembliesRelationsResponse, type AssembliesResponse } from "$lib/DBTypes";
    import { Folder, FolderOpen } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { onMount } from "svelte";
    import type { ArticleResponseExpanded } from "../../../routes/app/articles/+page.server";
    import AssemblyButton from "./AssemblyButton.svelte";
    import { getAssemblyContext } from "./assemblyContext";

    export let assembly: AssembliesResponse;
    export let nestLevel = 20;

    const { selectedAssembly } = getAssemblyContext();

    let childRelations: AssembliesRelationsReponseExpanded[] = [];
    const refreshRelations = async () => childRelations = await $page.data.pb.collection(Collections.AssembliesRelations).getFullList<AssembliesRelationsReponseExpanded>({ filter: `parent="${assembly.id}"`, expand: 'assembly_child,article_child.supplier' });

    onMount(async () => {
        await refreshRelations();
    });

    $: assembliesChildren = childRelations.filter(cr => cr.assembly_child !== undefined && cr.expand?.assembly_child !== undefined);

</script>

<AssemblyButton zIndex={nestLevel} selected={assembly.id === $selectedAssembly?.id} on:click={() => $selectedAssembly = assembly}>
    <Icon src={assembly.id !== $selectedAssembly?.id ? Folder : FolderOpen} class="inline w-5 h-5 mr-2" />
    {assembly.name}
</AssemblyButton>

{#if assembliesChildren.length > 0}
    <div class="ml-12 flex flex-col gap-6 items-start {nestLevel === 20 ? "mt-6" : ""}">
        {#each assembliesChildren as assembly_child}
            <svelte:self assembly={assembly_child.expand?.assembly_child} nestLevel={nestLevel - 1} />
        {/each}
    </div>
{/if}

