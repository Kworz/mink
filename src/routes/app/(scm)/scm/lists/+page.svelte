<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import AssemblyPreview from "$lib/components/assemblies/AssemblyPreview.svelte";
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Table from "$lib/components/table2/Table.svelte";
    import TableCell from "$lib/components/table2/TableCell.svelte";
    import { Collections, type AssembliesBuylistsRecord, type StoresRecord } from "$lib/DBTypes";
    import { PlusCircle, Printer, Squares2x2 } from "@steeze-ui/heroicons";
    import type { PageData, Snapshot } from "./$types";
    import Filter2 from "$lib/components/filter/Filter2.svelte";
    import RoundedLabel from "$lib/components/RoundedLabel.svelte";
    import type { FilterCondition } from "$lib/components/filter/filter2";
    import { browser } from "$app/environment";
    import Flex from "$lib/components/layout/flex.svelte";
    import Modal from "$lib/components/modal/Modal.svelte";
    import { enhance } from "$app/forms";

    export let data: PageData;

    let createList = false;
    let showClosedLists = false;
    let createMultipleLists = false;

    let selected: string[] = [];

    let filters: Array<FilterCondition> = [];
    let filter: string = $page.url.searchParams.get("filter") ?? "";

    let activeSort = $page.url.searchParams.get("sort") ?? "assembly.name";

    export const snapshot: Snapshot<Array<FilterCondition>> = {
        capture: () => filters,
        restore: (value) => filters = value
    }

    const triggerRefresh = () => {
        if(browser) {
            goto(`/app/scm/lists?sort=${activeSort}&filter=${filter}`, { noScroll: true });
        }
    }

    $: filter, activeSort, triggerRefresh();
    $: lists = data.lists.filter(list => !showClosedLists ? (list.closed === false) : true);

</script>

<h1>Listes d'achat d'assemblages</h1>
<FormInput type="checkbox" name="" label="Afficher les listes terminées" bind:checked={showClosedLists} />

<PillMenu message={(selected.length > 0 ? `${selected.length} éléments sélectionnés` : undefined)}>
    <PillMenuButton icon={PlusCircle} click={() => createList = !createList}>Créer une liste</PillMenuButton>
    {#if selected.length > 0}
        {@const firstList = data.lists.find(list => list.id === selected[0])}
        {#if !selected.some(s => data.lists.find(l => l.id === s)?.assembly !== firstList?.assembly)}
            <PillMenuButton role="primary" icon={Squares2x2} click={() => goto(`/app/scm/lists/grid?ids=${selected.join(",")}`)}>Ouvrir la grille</PillMenuButton>
        {/if}

        <PillMenuButton role="secondary" icon={Printer} click={() => window.open(`/app/scm/lists/print?lists=${selected.join(",")}`, '_blank')}>Imprimer</PillMenuButton>
    {/if}
</PillMenu>

{#if createList}
    <Modal on:close={() => createList = false} title="Créer une liste">

        <form action="?/createBuyList" method="post" use:enhance class="flex flex-col gap-4">
            <FormInput name="name" label="Nom de la liste" labelMandatory />
            <FormInput name="assembly_id" type="select" label="Assemblage" labelMandatory >
                <option value={undefined}>—</option>
                    {#each data.assemblies as assembly}
                        <option value={assembly.id}>{assembly.name}</option>
                    {/each}
            </FormInput>
            <FormInput name="project_id" type="select" label="Affaire" labelMandatory>
                <option value={undefined}>—</option>
                {#each data.projects as project}
                    <option value={project.id}>{project.name}</option>
                {/each}
            </FormInput>

            <FormInput name="multipleCreate" label="Créer plusieurs listes" type="checkbox" bind:checked={createMultipleLists} />

            {#if createMultipleLists}<FormInput name="list_amount" type="number" label="Nombre de listes" min={2} step={1} />{/if}

            <Button>Créer</Button>
        </form>

    </Modal>
{/if}

<Filter2 bind:filter bind:filters availableFilters={[
    { name: "name", default: true, type: "string" },
    { name: "assembly.name", type: "string" },
    { name: "project.name", type: "string" },
    { name: "closed", type: "boolean" }
]} class="mt-6" />

<Table 
    headers={[
        "selectAll",
        { label: "Liste", colname: "name" },
        { label: "Terminée", colname: "closed" },
        { label: "Assemblage de base", colname: "assembly.name" },
        { label: "Affaire", colname: "project.name" }
    ]}
    selectables={lists.map(l => l.id)}
    bind:selected={selected}
    bind:activeSort
    class="mt-6"
>

    {#each lists as list}
        <TableCell position="center"><input type="checkbox" bind:group={selected} value={list.id} /></TableCell>
        <TableCell><a href="/app/scm/lists/{list.id}">{list.name}</a></TableCell>
        <TableCell><RoundedLabel role={list.closed ? "success" : "warning"}>{list.closed ? "Terminée" : "En cours"}</RoundedLabel></TableCell>
        <TableCell><AssemblyPreview assembly={list.expand?.assembly} /></TableCell>
        <TableCell>{list.expand?.project?.name}</TableCell>
    {/each}

</Table>