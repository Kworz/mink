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
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { Collections, type AssembliesBuylistsRecord, type StoresRecord } from "$lib/DBTypes";
    import { PlusCircle } from "@steeze-ui/heroicons";
    import type { PageData, Snapshot } from "./$types";
    import Filter2 from "$lib/components/filter/Filter2.svelte";
    import RoundedLabel from "$lib/components/RoundedLabel.svelte";
    import type { FilterCondition } from "$lib/components/filter/filter2";
    import { browser } from "$app/environment";
    import Flex from "$lib/components/layout/flex.svelte";

    export let data: PageData;

    let createList = false;

    let showClosedLists = false;

    let createListName = "";
    let createListBaseAssembly: string | undefined = undefined;
    let createListProject: string | undefined = undefined;
    let createMultipleLists = false;
    let createMultipleListsCount = 1;

    let selected: string[] = [];

    const createListFn = async () => {

        if(createListName === "" || createListBaseAssembly === undefined || createListProject === undefined)
        { return }

        for(let i = 0; i < createMultipleListsCount; i++)
        {
            try
            {
                const listStore = await $page.data.pb.collection(Collections.Stores).create({
                    "name": (createMultipleLists) ? `${createListName} - ${i + 1}` : createListName,
                    "location": "Caisse navette",
                    "temporary": true

                } satisfies StoresRecord);

                const list = {
                    name: `${createListName} - ${i + 1}`,
                    assembly: createListBaseAssembly,
                    project: createListProject,
                    store: listStore.id,
                } satisfies AssembliesBuylistsRecord;

                if(createMultipleLists)
                    list.name = `${createListName} - ${i + 1}`;
                
                const listCreated = await $page.data.pb.collection(Collections.AssembliesBuylists).create(list);

                if(!createMultipleLists)
                {
                    goto("/app/scm/lists/" + listCreated.id);
                    return;
                }
            }
            catch(ex)
            {
                console.log(ex);
            }

            goto(`/app/scm/lists`);
        }
    }

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
    $: selectedAll = data.lists.length === selected.length;

</script>

<Wrapper>
    <h3>Listes d'achat d'assemblages</h3>

    <FormInput type="checkbox" name="" label="Afficher les listes terminées" bind:checked={showClosedLists} />

    <PillMenu>
        <PillMenuButton icon={PlusCircle} click={() => createList = !createList}>Créer une liste</PillMenuButton>
    </PillMenu>

    {#if createList}
        <h4>Créer une liste</h4>
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-end mt-6">
            <FormInput name="name" label="Nom de la liste" labelMandatory bind:value={createListName} />
            <FormInput name="assembly" type="select" label="Assemblage" labelMandatory bind:value={createListBaseAssembly}>
                {#await $page.data.pb.collection(Collections.Assemblies).getFullList({sort: "-favorite,name"}) then assemblies}
                    <option value={undefined}>—</option>
                    {#each assemblies as assembly}
                        <option value={assembly.id}>{assembly.name}</option>
                    {/each}
                {/await}
            </FormInput>
            <FormInput name="project" type="select" label="" labelMandatory bind:value={createListProject} >
                {#await $page.data.pb.collection(Collections.Projects).getFullList({sort: "-updated,name"}) then projects}
                    <option value={undefined}>—</option>
                    {#each projects as project}
                        <option value={project.id}>{project.name}</option>
                    {/each}
                {/await}
            </FormInput>

            <FormInput name="multipleCreate" label="Créer plusieurs listes" type="checkbox" bind:checked={createMultipleLists} />

            {#if createMultipleLists}<FormInput name="" type="number" label="Nombre de listes" min={1} step={1} bind:value={createMultipleListsCount}/>{/if}

            <Button on:click={createListFn}>Créer</Button>
        </div>
    {/if}

</Wrapper>

<Wrapper class="mt-6">

    {#if selected.length > 0}
        <Flex items="end" class="mb-6">
            <Button on:click={() => window.open(`/app/scm/lists/print?lists=${selected.join(",")}`, '_blank')}>Imprimer</Button>
            <Button on:click={() => goto(`/app/scm/lists/grid?ids=${selected.join(",")}`)}>Ouvrir la grille</Button>
        </Flex>
    {/if}

    <Filter2 bind:filter bind:filters availableFilters={[
        { name: "name", default: true, type: "string" },
        { name: "assembly.name", type: "string" },
        { name: "project.name", type: "string" },
        { name: "closed", type: "boolean" }
    ]} />

    <Table headers={[
        "selectAll",
        { label: "List", colname: "name" },
        { label: "Terminée", colname: "closed" },
        { label: "Assemblage de base", colname: "assembly.name" },
        { label: "Affaire", colname: "project.name" }]} 
    bind:activeSort>

    {#each lists as list}
        <TableCell><input type="checkbox" bind:group={selected} value={list.id} /></TableCell>
        <TableCell><a href="/app/scm/lists/{list.id}">{list.name}</a></TableCell>
        <TableCell><RoundedLabel role={list.closed ? "success" : "warning"}>{list.closed ? "Terminée" : "En cours"}</RoundedLabel></TableCell>
        <TableCell><AssemblyPreview assembly={list.expand?.assembly} /></TableCell>
        <TableCell>{list.expand?.project?.name}</TableCell>
    {/each}

    </Table>

<!--     <Table embeded>
        <svelte:fragment slot="head">
            <TableHead><input type="checkbox" checked={selectedAll} on:click={() => selected = selectedAll ? [] : data.lists.map(k => k.id)}/></TableHead>
            <TableHead col="name" bind:activeSort>Liste</TableHead>
            {#if showClosedLists}<TableHead col="closed" bind:activeSort>Terminée</TableHead>{/if}
            <TableHead col="assembly.name" bind:activeSort>Assemblage de base</TableHead>
            <TableHead col="project.name" bind:activeSort>Affaire</TableHead>
            
        </svelte:fragment>
    
        <svelte:fragment slot="body">
            {#each lists as list}
                <TableRow>
                    <TableCell><input type="checkbox" bind:group={selected} value={list.id} /></TableCell>
                    <TableCell><a href="/app/scm/lists/{list.id}">{list.name}</a></TableCell>
                    {#if showClosedLists}<TableCell><RoundedLabel role={list.closed ? "success" : "warning"}>{list.closed ? "Terminée" : "En cours"}</RoundedLabel></TableCell>{/if}
                    <TableCell><AssemblyPreview assembly={list.expand?.assembly} /></TableCell>
                    <TableCell>{list.expand?.project?.name}</TableCell>
                </TableRow>
            {/each}
        </svelte:fragment>
    </Table> -->
</Wrapper>