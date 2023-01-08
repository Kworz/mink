<script lang="ts">
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/Table.svelte";
    import type { ActionData, PageData } from "./$types";

    import { Icon } from "@steeze-ui/svelte-icon";
    import { ExclamationTriangle, Wrench, Check } from "@steeze-ui/heroicons";
    import FormInput from "$lib/components/FormInput.svelte";

    export let data: PageData;
    export let form: ActionData;
    
    let editList = false;

    $: if(form?.success === true && browser) { invalidateAll(); }

</script>

{#if editList}
    <form action="?/editList" method="post">
        <Flex direction="col" class="w-1/3">
            <FormInput label="Nom de la liste" labelMandatory={true} name="name" value={data.list.name}/>
            <Flex>
                <Button ringColor="ring-emerald-500" hoverColor="hover:bg-emerald-500">Valider</Button>
                <Button ringColor="ring-red-500" hoverColor="hover:bg-red-500" on:click={() => editList = false}>Annuler</Button>
            </Flex>
        </Flex>
    </form>
{:else}
    <h2>{data.list.name}</h2>
    <p>Nomenclature de base: {data.list.expand?.parent_nomenclature.name}</p>
    <button
        on:click={() => editList = true}
        class="my-2 text-violet-500 hover:text-blue-500 duration-200"
    >
        <Icon src={Wrench} class="h-5 w-5 inline"/>
        Editer les informations
    </button>
{/if}

<Table>
    <svelte:fragment slot="head">
        <tr>
            <th>Éléments</th>
            <th>Groupe</th>
            <th>Quantité</th>
            <th>Quantité nécéssaire</th>
        </tr>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#if data.nomenclature_rows.length > 0}
            {#each data.nomenclature_rows as row}
                {@const linked_row = data.list_rows.find(k => k.parent_nomenclature_row === row.id)}
                <tr>    
                    <td><a href="/app/articles/{row.expand.child_article.id}" class="font-medium hover:text-violet-500">{row.expand.child_article.name}</a></td>
                    <td>{row.group}</td>
                    <td>
                        <form action="?/updateRow" method="post">
                            <Flex gap={2}>
                                {#if linked_row?.id !== undefined} <input type="hidden" name="id" value={linked_row?.id} /> {/if}
                                <input type="hidden" name="parent_nomenclature_row" value={row.id} />
                                <FormInput name="quantity" type="number" value={(linked_row?.quantity) ?? 0} min={0} max={row.quantity_required} />
                                <Button><Icon src={Check} class="h-6 w-6" /></Button>
                            </Flex>
                        </form>
                        
                    </td>
                    <td>{row.quantity_required}</td>
                </tr>
            {/each}
        {:else}
            <p class="p-6 font-medium text-lg">
                <Icon src={ExclamationTriangle} theme="solid" class="h-10 w-10 mr-2 text-orange-500 inline"/>
                Aucun élément présent dans la nomenclature.
            </p>
        {/if}
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