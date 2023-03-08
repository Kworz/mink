<script lang="ts">

    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import User from "$lib/components/user/User.svelte";

    import type { PageData } from "./$types";
    export let data: PageData;

</script>

<svelte:head><title>Nomenclaturize — Affaires</title></svelte:head>

<h2>Affaires</h2>
<p>Liste des affaires.</p>

<Table>
    <svelte:fragment slot="head">
        <TableHead>Affaire</TableHead>
        <TableHead>Date de début</TableHead>
        <TableHead>Date de fin</TableHead>
        <TableHead>Utilisateurs</TableHead>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#each data.projects as project}
            <TableRow>
                <TableCell><a href="/app/projects/{project.id}">{project.name}</a></TableCell>
                <TableCell>{project.start_date}</TableCell>
                <TableCell>{project.end_date}</TableCell>
                <TableCell>
                    {#if project.expand?.attached_users !== undefined}
                        {#each project.expand.attached_users as user}
                            <User {user} />
                        {/each}
                    {/if}
                </TableCell>
            </TableRow>
        {/each}
    </svelte:fragment>
</Table>