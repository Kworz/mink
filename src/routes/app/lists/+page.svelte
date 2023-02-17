<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";

    import Table from "$lib/components/Table.svelte";
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
        <tr>
            <th>Liste</th>
            <th>Nomenclature de base</th>
            <th>Crée le</th>
            <th>Modifié le</th>
        </tr>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#each data.lists as list}
            <tr>
                <td><a href="/app/lists/{list.id}" class="font-medium hover:text-violet-500 duration-100">{list.name}</a></td>
                <td>{list.expand.parent_nomenclature.name}</td>
                <td>{list.created}</td>
                <td>{list.updated}</td>
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