<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";

    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;

    let addList = false;

</script>

<svelte:head><title>Nomenclaturize — Listes</title></svelte:head>

<h2>Listes</h2>
<p>Listes basées sur les nomenclatures.</p>

<form action="?/newList" method="POST">
    <Flex class="mt-8">
        {#if addList}
            <FormInput label="Nom de la liste" labelMandatory={true} name="name"/>
            <select name="parent_nomenclature" class="border border-zinc-500/50 bg-zinc-100 h-[42px] p-2 self-end rounded-sm">
                {#each data.nomenclatures as nomenclature}
                    <option value={nomenclature.id}>{nomenclature.name}</option>
                {/each}
            </select>
            <Button class="self-end">Créer</Button>
        {:else}
            <Button on:click={() => addList = true}>Créer une liste</Button>
        {/if}
    </Flex>
</form>

<Table>
    <svelte:fragment slot="head">
        <TableHead>Liste</TableHead>
        <TableHead>Nomenclature de base</TableHead>
        <TableHead>Créé le</TableHead>
        <TableHead>Affaire</TableHead>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#each data.lists as list}
            <TableRow>
                <TableCell><a href="/app/lists/{list.id}">{list.name}</a></TableCell>
                <TableCell>
                    {#if list.expand?.parent_nomenclature !== undefined}
                        <a href="/app/nomenclatures/{list.expand.parent_nomenclature.id}">{list.expand.parent_nomenclature.name}</a>
                    {:else}
                        Aucune liste ???
                    {/if}                
                </TableCell>
                <TableCell>{list.created}</TableCell>
                <TableCell>
                    {#if list.expand?.project !== undefined}
                        <a href="/app/projects/{list.expand.project.id}">{list.expand.project.name}</a>
                    {:else}
                        Aucun
                    {/if}
                </TableCell>
            </TableRow>
        {/each}
    </svelte:fragment>
</Table>