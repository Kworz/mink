<script lang="ts">
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/Table.svelte";
    import type { ActionData, PageData } from "./$types";

    import { Icon } from "@steeze-ui/svelte-icon";
    import { Check, ExclamationTriangle, Wrench } from "@steeze-ui/heroicons";
    import FormInput from "$lib/components/FormInput.svelte";
    import PredictInput from "$lib/components/PredictInput.svelte";
    import type { ArticleResponse, NomenclatureRowResponse } from "$lib/DBTypes";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import { enhance } from "$app/forms";
    import Filter from "$lib/components/filter/Filter.svelte";
    import { filterCompatible, type FilterQueryResult } from "$lib/components/filter/filter";

    export let data: PageData;
    export let form: ActionData;
    
    let editNomenclature = false;

    let queryFilters: FilterQueryResult<"name" | "supplier" | "manufacturer" | "reference" | "group"> = {};

    const listRowFilter = (nomRow: NomenclatureRowResponse, qf: typeof queryFilters): boolean => {

        let result = true;

        if(queryFilters.name !== undefined)
            result = result && filterCompatible(nomRow.expand?.child_article.name, queryFilters.name);
        if(queryFilters.reference !== undefined)
            result = result && filterCompatible(nomRow.expand?.child_article.reference, queryFilters.reference);
        if(queryFilters.supplier !== undefined)
            result = result && filterCompatible(nomRow.expand?.child_article.supplier, queryFilters.supplier);
        if(queryFilters.manufacturer !== undefined)
            result = result && filterCompatible(nomRow.expand?.child_article.manufacturer, queryFilters.manufacturer);
        if(queryFilters.group !== undefined)
            result = result && filterCompatible(nomRow.group, queryFilters.group)

        return result;
    }

    let selectedArticle: ArticleResponse | undefined = undefined;

    $: if(form?.success === true && browser) { invalidateAll(); }

</script>

{#if editNomenclature}
    <form action="?/editNomenclature" method="post">

        <Flex direction="col" class="w-1/3">
            <FormInput label="Nom de la nomenclature" labelMandatory={true} name="name" value={data.nomenclature.name}/>
            <FormInput label="Description" name="description" value={data.nomenclature.description}/>

            <Flex>
                <Button borderColor="border-emerald-500" hoverColor="hover:bg-emerald-500">Valider</Button>
                <Button borderColor="border-red-500" hoverColor="hover:bg-red-500" on:click={() => editNomenclature = false}>Annuler</Button>
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

<Flex direction="col" gap={4} class="mt-6">
    <Flex gap={4} items="end">
    
        <form action="?/addItem" method="post" use:enhance>
            <Flex>
        
                <PredictInput articleArray={data.articles} bind:selectedArticle class="self-end"/>
                <input type="hidden" name="child_article" value={selectedArticle?.id} />
        
                <Input label="Quantité nécéssaire" name="quantity_required" labelMandatory={true}/>
                <Input label="Groupe" name="group" />
        
                <Button class="self-end">Ajouter!</Button>
                
        
            </Flex>
        </form>
        
        <form action="?/copyNomenclature" method="post" use:enhance>
            <Button hoverColor="hover:bg-amber-500" borderColor="border-amber-500">Copier</Button>
        </form>
    </Flex>

    <Filter availableFilters={["name", "manufacturer", "supplier", "reference", "group"]} bind:filterResult={queryFilters}/>
</Flex>
 
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
            {#each data.nomenclature.expand['nomenclature_row(parent_nomenclature)'].filter(k => listRowFilter(k, queryFilters)) as row}
                <tr>    
                    <td>
                        <ArticleRow article={row.expand?.child_article} />
                    </td>
                    <td>
                        <form action="?/editItem" method="post" use:enhance>
                            <input type="hidden" id="row_id" value={row.id} name="row_id"/>
                            <input type="text" bind:value={row.group} name="group"  class="p-1 rounded-md"/>
                            <Button><Icon src={Check} class="h-4 w-4"/></Button>
                        </form>
                    </td>
                    <td>
                        <form action="?/editItem" method="post" use:enhance>
                            <input type="hidden" id="row_id" value={row.id} name="row_id"/>
                            <input type="number" bind:value={row.quantity_required} name="quantity_required"  class="p-1 rounded-md"/>
                            <Button><Icon src={Check} class="h-4 w-4"/></Button>
                        </form>
                    </td>
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