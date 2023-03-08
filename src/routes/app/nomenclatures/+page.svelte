<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";

    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import User from "$lib/components/user/User.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;

    let createNomenclature = false;

</script>

<svelte:head><title>Nomenclaturize — Nomenclatures</title></svelte:head>

<h2>Nomenclatures</h2>
<p>Liste des nomenclatures dans la base</p>

<form action="?/newNomenclature" method="post">
    <Flex class="mt-8">
        {#if createNomenclature}
            <FormInput label="Nom de la nomenclature" labelMandatory={true} name="name" />
            <FormInput label="Description" name="description" />
            <Button class="self-end">Créer</Button>
        {:else}
            <Button on:click={() => createNomenclature = true}>Créer une nomenclature</Button>
        {/if}
    </Flex>
</form>

<Table>
    <svelte:fragment slot="head">
        <TableHead>Nomenclature</TableHead>
        <TableHead>Description</TableHead>
        <TableHead>Éléments</TableHead>
        <TableHead>Créé par</TableHead>
        <TableHead>Créé le</TableHead>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#each data.nomenclatures as nomenclature}
            <TableRow>
                <TableCell><a href="/app/nomenclatures/{nomenclature.id}">{nomenclature.name}</a></TableCell>
                <TableCell>{nomenclature.description}</TableCell>
                <TableCell>{nomenclature.expand["nomenclature_row(parent_nomenclature)"]?.length ?? 0}</TableCell>
                <TableCell>
                    {#if nomenclature.expand.created_by !== undefined}
                        <User user={nomenclature.expand.created_by} />
                    {/if}
                </TableCell>
                <TableCell>{nomenclature.created}</TableCell>
            </TableRow>
        {/each}
    </svelte:fragment>
</Table>