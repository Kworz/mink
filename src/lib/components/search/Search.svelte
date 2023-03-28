<script lang="ts">
    import { page } from "$app/stores";
    import { MagnifyingGlass } from "@steeze-ui/heroicons";

    import { Icon } from "@steeze-ui/svelte-icon";
    import { onMount } from "svelte";
    import { portal } from "svelte-portal";
    import { fade } from "svelte/transition";
    import ArticleRow from "../article/ArticleRow.svelte";
    import AssemblyPreview from "../assemblies/AssemblyPreview.svelte";
    import Input from "../Input.svelte";
    import { search } from "./search";

    let searchTerm = "";

    let results: Awaited<ReturnType<typeof search>> = { lists: [], articles: [], assemblies: []};

    let searchInput: HTMLInputElement | undefined = undefined;

    const handleKeyboard = (e: KeyboardEvent) => { 

        if (e.key === "Escape") {
            searchTerm = "";
        }
        else if (e.key.toLowerCase() === "k" && e.metaKey) {
            e.preventDefault();
            searchInput?.focus();
        }
    };

    onMount(() => {
        document.addEventListener("keydown", handleKeyboard);
        return () => {
            document.removeEventListener("keydown", handleKeyboard);
        };
    })

    $: searchTerm, function() {
        search(searchTerm, $page.data.pb).then((r) => {
            results = r;
        });
    }();

</script>

<Input bind:input={searchInput} bind:value={searchTerm} placeholder="Recherche" class="w-full">
    <Icon src={MagnifyingGlass} class="h-4 w-4 mr-4" />
</Input>

{#if searchTerm.length > 0}
    <button class="fixed inset-0 z-50 h-screen w-screen backdrop-blur-lg bg-black/10 flex flex-col items-center justify-center" use:portal={'body'} in:fade={{duration:150}} out:fade={{duration:150}} on:click|self={() => searchTerm = ""}>

        <div class="max-h-[66%] w-5/6 md:w-1/3 overflow-x-scroll p-6 bg-white dark:bg-zinc-900 rounded-lg">
            <Input bind:value={searchTerm} placeholder="Recherche" class="w-full">
                <Icon src={MagnifyingGlass} class="h-4 w-4 mr-4" />
            </Input>

            <button class="mt-6 rounded-md flex flex-col gap-4" on:click={() => searchTerm = ""}>

                {#if results.articles.length > 0}
                    <h4>Articles</h4>
                    {#each results.articles as article}
                        <ArticleRow {article} />
                    {/each}
                {/if}
                {#if results.assemblies.length > 0}
                    <h4>Assemblages</h4>
                    {#each results.assemblies as assembly}
                        <AssemblyPreview {assembly} />
                    {/each}
                {/if}
                {#if results.lists.length > 0}
                    <h4>Listes</h4>
                    {#each results.lists as list}
                        <a href="/app/lists2/{list.id}">{list.name}</a>
                    {/each}
                {/if}
            </button>
        </div>
    </button>
{/if}
