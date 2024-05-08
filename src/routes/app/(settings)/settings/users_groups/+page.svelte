<script lang="ts">

    import { _ } from "svelte-i18n";
    import type { PageData } from "./$types";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import BooleanLabel from "$lib/components/derived/labels/BooleanLabel.svelte";
    import Modal from "$lib/components/generics/modal/Modal.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import { groupPermissions } from "$lib/permission";
    import PermissionLabelGroup from "$lib/components/derived/PermissionLabelGroup.svelte";

    export let data: PageData;

    let showGroupPermissions: PageData["groups"][number] | undefined;

</script>

<svelte:head>
    <title>{$_('app.settings.users_groups.lead')} - mink</title>
</svelte:head>

<h1>{$_('app.settings.users_groups.lead')}</h1>
<p>{$_('app.settings.users_groups.description')}</p>

{#if showGroupPermissions}
    <Modal title={$_("app.settings.users_groups.modal_title", { values: { group: showGroupPermissions.name }})} on:close={() => showGroupPermissions = undefined}>
        {#if showGroupPermissions.admin}
            <span class="text-orange-500 font-semibold">{$_('app.settings.users_groups.admin_group_warning')}</span>
        {:else}
            <p>{$_('app.settings.users_groups.modal_description', { values: { group: showGroupPermissions.name }})}</p>
            <Table headers={[{ label: $_('app.generic.permission_zone') }, { label: $_('app.generic.permissions') }]} class="mt-6">
                {#each groupPermissions as permission}
                    {@const permissionValue = showGroupPermissions[permission]}
                    <TableCell>{permission}</TableCell>
                    <TableCell><PermissionLabelGroup permission={permissionValue} /></TableCell>
                {/each}
            </Table>
        {/if}
    </Modal>
{/if}

<Table headers={[{ label: $_('app.generic.name') }, { label: $_('app.generic.user_count') }, { label: $_('app.permission.is_admin') }, { label: $_('app.generic.permissions') }]} class="mt-6">
    {#each data.groups as group}
        <TableCell><a href="/app/settings/users_groups/{group.id}">{group.name}</a></TableCell>
        <TableCell>{group.users.length}</TableCell>
        <TableCell><BooleanLabel value={group.admin} /></TableCell>
        <TableCell>
            <Button size="small" on:click={() => showGroupPermissions = group}>{$_('app.settings.users_groups.see_permissions')}</Button>
        </TableCell>
    {/each}
</Table>


