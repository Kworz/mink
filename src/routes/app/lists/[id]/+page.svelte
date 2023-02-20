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
    import type { NomenclatureRowResponse } from "$lib/DBTypes";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import Filter from "$lib/components/filter/Filter.svelte";
    import { filterCompatible, type FilterQueryResult } from "$lib/components/filter/filter";
    import { enhanceNoReset } from "$lib/enhanceNoReset";

    export let data: PageData;
    export let form: ActionData;
    
    let editList = false;
    let confirmDelete = false;

    let queryFilters: FilterQueryResult<"name" | "supplier" | "manufacturer" | "reference" | "valid"> = {};

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

        if(queryFilters.valid !== undefined)
        {
            const list_row_reference = data.list_rows.find(listRow => listRow.parent_nomenclature_row === nomRow.id);
            const isRowValid = nomRow.quantity_required === (list_row_reference?.quantity ?? 0);

            if(queryFilters.valid === "true")
                result = result && isRowValid;
            else if(queryFilters.valid === "false")
                result = result && !isRowValid;
        }

        return result;
    }

    $: if(form?.success === true && browser) { invalidateAll(); }
    
    $: remainingElements = data.nomenclature_rows.filter(row => {
        const list_row = data.list_rows.find(lr => lr.parent_nomenclature_row == row.id);

        return row.quantity_required === (list_row?.quantity ?? 0)

    }).length;

    $: remainingPrice = data.nomenclature_rows.map(nr => {
        const list_row_remain = data.list_rows.find(lr => lr.parent_nomenclature_row == nr.id)?.quantity ?? 0;

        return (nr.expand?.child_article.price ?? 0) * (nr.quantity_required - list_row_remain)
    }).reduce((p, c) => p+c, 0);

    $: if(confirmDelete) { setTimeout(() => confirmDelete = false, 5000); };

</script>

<svelte:head>
    <title>Liste — {data.list.name}</title>
</svelte:head>

{#if editList}
    <form action="?/editList" method="post">
        <Flex direction="col" class="w-1/3">
            <FormInput label="Nom de la liste" labelMandatory={true} name="name" value={data.list.name}/>
            <Flex>
                <Button borderColor="border-emerald-500" hoverColor="hover:bg-emerald-500">Valider</Button>
                <Button borderColor="border-red-500" hoverColor="hover:bg-red-500" on:click={() => editList = false}>Annuler</Button>
            </Flex>
        </Flex>
    </form>
{:else}
    <h2>{data.list.name}</h2>
    <p>Nomenclature de base: <span class="text-violet-500 font-medium"> {data.list.expand?.parent_nomenclature.name}</span>.</p>
    <p>Montant restant pour terminer la liste: <span class="text-violet-500 font-medium"> {remainingPrice} €</span>.</p>
    <p>Articles validés: <span class="text-violet-500 font-medium">{remainingElements} / {data.nomenclature_rows.length}</span>.</p>
    <button
        on:click={() => editList = true}
        class="mt-2 text-violet-500 hover:text-blue-500 duration-200"
    >
        <Icon src={Wrench} class="h-5 w-5 inline"/>
        Editer les informations
    </button>
{/if}

<Flex items="end">

    <Filter availableFilters={["name", "manufacturer", "supplier", "reference", "valid"]} bind:filterResult={queryFilters}/>

    <Flex class="mt-6">
        <Button borderColor="border-emerald-500" hoverColor="hover:bg-emerald-500" on:click={() => {
            window.open(`/app/lists/${data.list.id}/export/`, '_blank')?.focus();
        }}>
            Export Excel
        </Button>
        {#if confirmDelete}
            <form action="?/removeList" method="post" use:enhanceNoReset>
                <Button borderColor="border-red-500" hoverColor="hover:bg-red-500">Etes vous sur ?</Button>
            </form>
        {:else}
            <Button borderColor="border-red-500" hoverColor="hover:bg-red-500" on:click={() => confirmDelete = true}>Supprimer la liste</Button>
        {/if}
    </Flex>
</Flex>

<Table>
    <svelte:fragment slot="head">
        <tr>
            <th>Éléments ({data.nomenclature_rows.filter((k) => listRowFilter(k , queryFilters)).length})</th>
            <th>Groupe</th>
            <th>Quantité</th>
            <th>Quantité nécéssaire</th>
            <th>Cout restant</th>
            <th>Validé</th>
        </tr>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#if data.nomenclature_rows.length > 0}
            {#each data.nomenclature_rows.filter((k) => listRowFilter(k, queryFilters)) as row}
            
                {@const linked_row = data.list_rows.find(k => k.parent_nomenclature_row === row.id)}
                {@const isValid = row.quantity_required == linked_row?.quantity}
                {@const remainingQuantity = row.quantity_required - (linked_row?.quantity ?? 0)}

                <tr>    
                    <td>
                        <ArticleRow article={row.expand?.child_article} displayStock={true} />
                    </td>
                    <td>{row.group}</td>
                    <td>
                        <form action="?/updateRow" method="post" use:enhanceNoReset>
                            <Flex gap={2} items="center">
                                {#if linked_row?.id !== undefined} <input type="hidden" name="id" value={linked_row?.id} /> {/if}
                                <input type="hidden" name="parent_nomenclature_row" value={row.id} />
                                <FormInput name="quantity" type="number" value={(linked_row?.quantity) ?? 0} min={0} max={row.quantity_required} backgroundColor="bg-white" />
                                <Button class="rounded-full self-center py-1 px-1"><Icon src={Check} class="h-4 w-4" /></Button>
                            </Flex>
                        </form>
                        
                    </td>
                    <td>{row.quantity_required}</td>
                    <td>
                        {(remainingQuantity * (row.expand?.child_article.price)) ? remainingQuantity * (row.expand?.child_article.price) : "—"} €
                    </td>
                    <td><span class="font-semibold" class:text-red-500={!isValid} class:text-emerald-500={isValid}>{isValid ? "Complet" : "Incomplet"}</span></td>
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