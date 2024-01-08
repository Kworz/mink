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
    import type { ActionData, PageData } from "./$types";
    import { enhance } from "$app/forms";

    import { env } from "$env/dynamic/public";
    import Modal from "$lib/components/modal/Modal.svelte";

    export let data: PageData;
    export let form: ActionData;

    let filters: Array<FilterCondition> = [];
    let filter = "";

    let createAssembly = false;

    const triggerResfresh = () => {
        if(browser)
            goto(`/app/scm/assemblies/?filter=${filter}`);
    }

    $: filter, triggerResfresh();

</script>

<svelte:head>
    <title>Liste des Assemblages — mink</title>
</svelte:head>

{#if createAssembly}
    <Modal on:close={() => createAssembly = false} title="Créer un assemblage">
        {#if form?.createAssembly?.error}<p class="text-red-500">{form?.createAssembly?.error}</p>{/if}

        <form action="?/createAssembly" method="post" use:enhance class="flex flex-col gap-4">
            <FormInput name="name" label="Nom" labelMandatory />
            <FormInput name="description" label="Description" labelMandatory parentClass="grow" />
            <Button role="primary">Créer</Button>
        </form>
    </Modal>
{/if}

<h1>Liste des assemblages</h1>

<PillMenu>
    <PillMenuButton icon={PlusCircle} click={() => createAssembly = !createAssembly}>Créer un assemblage</PillMenuButton>
</PillMenu>

<Filter2 bind:filter bind:filters availableFilters={[{ name: "name", default: true, type: "string" }, { name:"description", type: "string" }, { name: "favorite", type: "boolean" }]} class="mt-6" />

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:cols-4 gap-4 mt-6">
    {#each data.assemblies as assembly}
        <Wrapper>

            <a href="/app/scm/assemblies/{assembly.id}">
                <Flex items="center">
                
                    {#if assembly.thumbnail !== null}
                        <img src={assembly.thumbnail} alt="Miniature {assembly.name}" class="aspect-square object-cover h-24 duration-100 rounded-md ring-1 ring-zinc-400/25" />
                    {:else}
                        <div class="aspect-square object-cover rounded-md border h-24 border-zinc-500/50">
                            <Icon src={VideoCameraSlash} class="h-full w-8 m-auto text-red-500" />
                        </div>
                    {/if}

                    <div>
                        <p>
                            {#if 1 == 2}<Icon src={Star} theme="solid" class="h-4 w-4 mb-1 mr-0.25 text-violet-500 inline" />{/if}
                            {assembly.name}
                        </p>
                        <p class="text-zinc-500 text-base font-normal">{assembly.description}</p>
                    </div>
                </Flex>
            </a>    
        </Wrapper>
    {:else}
        <h3 class="text-orange-500">Aucun assemblage créé</h3>
    {/each}
</div>