<script lang="ts">
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import type { FilterCondition } from "$lib/components/filter/filter2";
    import Filter2 from "$lib/components/filter/Filter2.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { PlusCircle, PuzzlePiece, Star, VideoCameraSlash } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { PageData } from "./$types";

    export let data: PageData;

    let filters: Array<FilterCondition> = [];
    let filter = "";

    let createAssembly = false;

    let createAssemblyName = "";
    let createAssemblyDesc = "";

    const triggerResfresh = () => {
        if(browser)
            goto(`/app/scm/assemblies/?filter=${filter}`);
    }

    $: filter, triggerResfresh();

</script>

<Wrapper>
    <h3>Liste des assemblages</h3>

    <Filter2 bind:filter bind:filters availableFilters={[{ name: "name", default: true }, { name:"description" }, { name: "favorite" }]} class="mt-6" />

    <PillMenu>
        <PillMenuButton icon={PlusCircle} click={() => createAssembly = !createAssembly}>Créer un assemblage</PillMenuButton>
    </PillMenu>

    {#if createAssembly}
        <h4 class="mt-6 mb-2">Créer un assemblage</h4>
        <form action="?/createAssembly" class="flex flex-col md:flex-row gap-4 items-end">
            <FormInput name="name" label="Nom" labelMandatory bind:value={createAssemblyName} />
            <FormInput name="description" label="Description" labelMandatory bind:value={createAssemblyDesc} parentClass="grow" />
            <Button role="primary">Créer</Button>
        </form>
    {/if}

</Wrapper>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:cols-4 gap-4 mt-6">
    {#each data.assemblies as assembly}
        <Wrapper>

            <a href="/app/scm/assemblies/{assembly.id}">
                <Flex items="center">
                
                    {#if assembly.thumbnail !== "" && browser}
                        <img src="http://{window.location.hostname}:8090/api/files/{assembly.collectionName}/{assembly.id}/{assembly.thumbnail}?thumb=200x200" alt={assembly.thumbnail} class="aspect-square object-cover h-24 duration-100 rounded-md border border-zinc-500/50" />
                    {:else}
                        <div class="aspect-square object-cover rounded-md border h-24 border-zinc-500/50">
                            <Icon src={VideoCameraSlash} class="h-full w-5 m-auto text-red-500" />
                        </div>
                    {/if}

                    <div>
                        <p>
                            {#if assembly.favorite}<Icon src={Star} theme="solid" class="h-4 w-4 mb-1 mr-2 text-violet-500 inline" />{/if}
                            {assembly.name}
                        </p>
                        <p class="text-zinc-500 text-base font-normal">{assembly.description}</p>
                    </div>
                </Flex>
            </a>    
        </Wrapper>
    {/each}
</div>