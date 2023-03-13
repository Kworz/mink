<script lang="ts">
    import { enhance } from "$app/forms";
import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";

    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import User from "$lib/components/user/User.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;

    let createNomenclature = false;

</script>

<svelte:head><title>Nomenclaturize — Nomenclatures</title></svelte:head>

<Wrapper>    
    <Flex items="center" justify="between">
        <h2>Nomenclatures</h2>        
        <Button on:click={() => createNomenclature = !createNomenclature}>Créer une nomenclature</Button>
    </Flex>

    <Table embeded={true}>
        <svelte:fragment slot="head">
            <TableHead colWidth="w-1/6">Nomenclature</TableHead>
            <TableHead colWidth="w-1/3">Description</TableHead>
            <TableHead>Éléments</TableHead>
            <TableHead>Créé par</TableHead>
        </svelte:fragment>
    
        <svelte:fragment slot="body">
            {#if createNomenclature}
                <TableRow>
                    <TableCell>
                        <form id="create_nomenclature" action="?/newNomenclature" method="post" use:enhance>
                            <FormInput label="Nom de la nomenclature" labelMandatory={true} name="name" />
                        </form>
                    </TableCell>
                    <TableCell colspan={3}>
                        <FormInput form="create_nomenclature" label="Description" name="description" />
                    </TableCell>
                    <TableCell>
                        <Button form="create_nomenclature">Créer</Button>
                    </TableCell>
                </TableRow>
            {/if}
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
                </TableRow>
            {/each}
        </svelte:fragment>
    </Table>
</Wrapper>
