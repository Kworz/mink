<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";

    import Table from "$lib/components/Table.svelte";
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
        <tr>
            <th>Nomenclature</th>
            <th>Description</th>
            <th>Éléments</th>
            <th>Créé par</th>
            <th>Créé le</th>
        </tr>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#each data.nomenclatures as nomenclature}
            <tr>
                <td><a href="/app/nomenclatures/{nomenclature.id}" class="font-medium hover:text-violet-500 duration-100">{nomenclature.name}</a></td>
                <td>{nomenclature.description}</td>
                <td>{nomenclature.expand["nomenclature_row(parent_nomenclature)"]?.length ?? 0}</td>
                <td>{#if nomenclature.expand.created_by !== undefined}
                    <User user={nomenclature.expand.created_by} />
                {/if}</td>
                <td>{nomenclature.created}</td>
            </tr>
        {/each}
    </svelte:fragment>
</Table>

<style>
    th { @apply p-4 border-b border-b-violet-500/75 text-left; }
    td { @apply p-4 border-b border-b-violet-500/25;}
    tr:last-child > td{ @apply border-0; }
</style>