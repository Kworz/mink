<script lang="ts">
    import type { PageData } from "./$types";
    import Table from "$lib/components/table/Table.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import { PlusCircle } from "@steeze-ui/heroicons";

    export let data: PageData;

</script>
<Wrapper>

    <h2>Suivi assemblages</h2>

    <PillMenu>
        <PillMenuButton icon={PlusCircle}>Créer un suivi d'assemblage</PillMenuButton>
    </PillMenu>

    <Table embeded={true}>

        <svelte:fragment slot="head">
            <TableHead>Nom</TableHead>
            <TableHead>Nomenclature parent</TableHead>
            <TableHead>Liste parent</TableHead>
        </svelte:fragment>

        <svelte:fragment slot="body">
            {#each data.builds as build}
                <TableRow>
                    <TableCell><a href="/app/builds/{build.id}">{build.name}</a></TableCell>
                    <TableCell>{build.parent_nomenclature}</TableCell>
                    <TableCell>{build.parent_list}</TableCell>
                </TableRow>
            {/each}
        </svelte:fragment>
    </Table>

</Wrapper>