<script lang="ts">
    import { browser } from "$app/environment";
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import EmptyData from "$lib/components/EmptyData.svelte";
    import Filter2 from "$lib/components/derived/filter/Filter2.svelte";
    import type { FilterCondition } from "$lib/components/derived/filter/filter2";
    import Button from "$lib/components/generics/Button.svelte";
    import Wrapper from "$lib/components/generics/containers/Wrapper.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import { PlusCircle, VideoCameraSlash } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { ActionData, PageData } from "./$types";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import { _ } from "svelte-i18n";

    export let data: PageData;
    export let form: ActionData;

    let filters: Array<FilterCondition> = [];
    let filter = "";

    let createAssembly = false;
    let createFormSent = false;

    const triggerResfresh = () => {
        if(browser)
            goto(`/app/scm/assemblies/?filter=${filter}`);
    }

    $: filter, triggerResfresh();

    $: if(form?.createAssembly.error !== undefined) { createFormSent = false; setTimeout(() => form = null, 3000); }

</script>

<svelte:head>
    <title>{$_('scm.assemblies.list')} — mink</title>
</svelte:head>

{#if createAssembly}
    <MenuSide on:close={() => createAssembly = false} title={$_('scm.assemblies.actions.create')}>
        {#if form?.createAssembly && "error" in form.createAssembly}<p class="text-red-500 mb-2">{$_(form.createAssembly.error)}</p>{/if}

        <form action="?/createAssembly" method="post" use:enhance class="flex flex-col gap-4" on:submit={() => createFormSent = true}>
            <FormInput name="name" label={$_('scm.assembly.name')} labelMandatory value={form?.createAssembly.name ?? ""} />
            <FormInput name="description" label={$_('app.generic.description')} value={form?.createAssembly.description ?? ""} />
            <Button role="primary" class="self-start" suspense={createFormSent}>{$_('app.action.create')}</Button>
        </form>
    </MenuSide>
{/if}

<h1>{$_('scm.assemblies.list')}</h1>
<p>{$_('scm.assemblies.description')}</p>

<PillMenu>
    <PillMenuButton icon={PlusCircle} click={() => createAssembly = !createAssembly}>{$_('scm.assemblies.actions.create')}</PillMenuButton>
</PillMenu>

{#if data.assemblies.length > 0}
    <Filter2 bind:filter bind:filters availableFilters={[{ name: "name", default: true, type: "string" }, { name:"description", type: "string" }, { name: "favorite", type: "boolean" }]} class="mt-6" />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:cols-4 gap-4 mt-6">
        {#each data.assemblies as assembly}
            <Wrapper>
    
                <a href="/app/scm/assemblies/{assembly.id}">
                    <Flex items="center">
                    
                        {#if assembly.thumbnail !== null}
                            <img src={assembly.thumbnail} alt={$_('scm.assembly.thumbnail', { values: { name: assembly.name }})} class="aspect-square object-cover h-24 duration-100 rounded-md ring-1 ring-zinc-400/25" />
                        {:else}
                            <div class="aspect-square object-cover rounded-md border h-24 border-zinc-500/50">
                                <Icon src={VideoCameraSlash} class="h-full w-8 m-auto text-red-500" />
                            </div>
                        {/if}
    
                        <div>
                            <p>{assembly.name}</p>
                            <p class="text-zinc-500 text-base font-normal">{assembly.description || $_('app.generic.decription_null')}</p>
                        </div>
                    </Flex>
                </a>    
            </Wrapper>
        {/each}
    </div>
{:else}
    <EmptyData on:click={() => createAssembly = true }/>
{/if}

