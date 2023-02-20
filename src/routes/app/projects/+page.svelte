<script lang="ts">

    import Calendar from "$lib/components/calendar/Calendar.svelte";
    import Table from "$lib/components/Table.svelte";
    import User from "$lib/components/user/User.svelte";

    import type { PageData } from "./$types";
    export let data: PageData;

</script>

<svelte:head><title>Nomenclaturize — Affaires</title></svelte:head>

<h2>Affaires</h2>
<p>Liste des affaires.</p>

<Table>
    <svelte:fragment slot="head">
        <tr>
            <th>Affaire</th>
            <th>Date début</th>
            <th>Date fin</th>
            <th>Utilisateurs</th>
        </tr>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#each data.projects as project}
            <tr>
                <td><a href="/app/projects/{project.id}" class="font-medium hover:text-violet-500 duration-100">{project.name}</a></td>
                <td>{project.start_date}</td>
                <td>{project.end_date}</td>
                <td>
                    {#if project.expand?.attached_users !== undefined}
                        {#each project.expand.attached_users as user}
                            <User {user} />
                        {/each}
                    {/if}
                </td>
            </tr>
        {/each}
    </svelte:fragment>
</Table>

<style>

    th {
        @apply p-4 border-b border-b-violet-500/75 text-left;
    }

    td {

        @apply p-4 border-b border-b-violet-500/25;
    }

    tr:last-child > td{
        @apply border-0;
    }
</style>