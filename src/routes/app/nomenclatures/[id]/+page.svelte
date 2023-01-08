<script lang="ts">
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/Table.svelte";
    import type { ActionData, PageData } from "./$types";

    import { Icon } from "@steeze-ui/svelte-icon";
    import { ExclamationTriangle, Wrench } from "@steeze-ui/heroicons";
    import FormInput from "$lib/components/FormInput.svelte";

    export let data: PageData;
    export let form: ActionData;
    
    let expandAddItem = false;

    let editNomenclature = false;

    $: if(form?.success === true && browser) { invalidateAll(); }

</script>

{#if editNomenclature}
    <form action="?/editNomenclature" method="post">

        <Flex direction="col" class="w-1/3">
            <FormInput label="Nom de la nomenclature" labelMandatory={true} name="name" value={data.nomenclature.name}/>
            <FormInput label="Description" name="description" value={data.nomenclature.description}/>

            <Flex>
                <Button ringColor="ring-emerald-500" hoverColor="hover:bg-emerald-500">Valider</Button>
                <Button ringColor="ring-red-500" hoverColor="hover:bg-red-500" on:click={() => editNomenclature = false}>Annuler</Button>
            </Flex>
        </Flex>
    </form>
{:else}
    <h2>{data.nomenclature.name}</h2>
    <p>{data.nomenclature.description}</p>
    <button
        on:click={() => editNomenclature = true}
        class="my-2 text-violet-500 hover:text-blue-500 duration-200"
    >
        <Icon src={Wrench} class="h-5 w-5 inline"/>
        Editer les informations
    </button>
{/if}


<div class="mt-8">
    {#if expandAddItem === true}
        <form action="?/addItem" method="post">
            <Flex>

                <select class="py-1 px-2 ring-2 rounded-md ring-zinc-600 self-end" name="child_article">
                    <!-- TODO: Filter arry to not add item twice -->
                    {#each data.articles as article}
                        <option value={article.id}>{article.name}</option>
                    {/each}
                </select>

                <Input label="Quantité nécéssaire" name="quantity_required" labelMandatory={true}/>
                <Input label="Groupe" name="group" />

                <Button class="self-end">Ajouter!</Button>
            </Flex>
        </form>
    {:else}
        <Button on:click={() => expandAddItem = true}>Ajouter un article dans la nomenclature</Button>
    {/if}
</div>

<Table>
    <svelte:fragment slot="head">
        <tr>
            <th>Éléments</th>
            <th>Groupe</th>
            <th>Quantité nécéssaire</th>
            <th>Supprimer</th>
        </tr>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#if data.nomenclature.expand?.['nomenclature_row(parent_nomenclature)'] !== undefined}
            {#each data.nomenclature.expand['nomenclature_row(parent_nomenclature)'] as row}
                <tr>    
                    <td><a href="/app/articles/{row.expand.child_article.id}" class="font-medium hover:text-violet-500">{row.expand.child_article.name}</a></td>
                    <td>{row.group}</td>
                    <td>{row.quantity_required}</td>
                    <td>
                        <form action="?/deleteItem" method="post">
                            <input type="hidden" id="row_id" value={row.id} name="row_id"/>
                            <Button>Supprimer</Button>
                        </form>
                    </td>
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