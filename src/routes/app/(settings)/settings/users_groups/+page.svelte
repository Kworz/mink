<script lang="ts">

    import { _ } from "svelte-i18n";
    import type { PageData } from "./$types";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";

    export let data: PageData;

</script>

<h1>{$_('app.settings.users_groups.lead')}</h1>
<p>{$_('app.settings.users_groups.description')}</p>

<Table headers={[{ label: "Nom" }, { label: "Nombre d'utilisateurs" }, { label: "Administrateur" }, { label: "Droits sur les articles" }]} class="mt-6">
    {#each data.groups as group}
        <TableCell><a href="/app/settings/users_groups/{group.id}">{group.name}</a></TableCell>
        <TableCell>{group.users.length}</TableCell>
        <TableCell>{group.admin}</TableCell>
        <TableCell>{group.article || "—"}</TableCell>
    {/each}
</Table>


