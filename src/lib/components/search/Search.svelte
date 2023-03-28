<script lang="ts">
    import { page } from "$app/stores";
    import { MagnifyingGlass } from "@steeze-ui/heroicons";

    import { Icon } from "@steeze-ui/svelte-icon";
    import { portal } from "svelte-portal";
    import { fade } from "svelte/transition";
    import ArticleRow from "../article/ArticleRow.svelte";
    import AssemblyPreview from "../assemblies/AssemblyPreview.svelte";
    import Input from "../Input.svelte";
    import { search } from "./search";

    let searchTerm = "";

</script>

<Input bind:value={searchTerm} placeholder="Recherche" class="w-full">
    <Icon src={MagnifyingGlass} class="h-4 w-4 mr-4" />
</Input>

{#if searchTerm.length > 0}
    <div class="fixed inset-0 z-50 h-screen w-screen backdrop-blur-lg bg-black/10 flex flex-col items-center justify-center" use:portal={'body'} in:fade={{duration:150}} out:fade={{duration:150}}>

        <div class="max-h-[66%] overflow-x-scroll p-6 bg-white rounded-lg">
            <Input bind:value={searchTerm} placeholder="Recherche" class="w-full">
                <Icon src={MagnifyingGlass} class="h-4 w-4 mr-4" />
            </Input>

            {#await search(searchTerm, $page.data.pb) then val}
                <button class="p-6 rounded-md flex flex-col gap-4" on:click={() => searchTerm = ""}>
                    {#each val.articles as article}
                        <ArticleRow {article} />
                    {/each}
                    {#each val.assemblies as assembly}
                        <AssemblyPreview {assembly} />
                    {/each}
                </button>
            {/await}

        </div>
    </div>
{/if}
