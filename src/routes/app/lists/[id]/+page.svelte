<script lang="ts">
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import type { ActionData, PageData, Snapshot } from "./$types";

    import { Icon } from "@steeze-ui/svelte-icon";
    import { ExclamationTriangle, Wrench, Check } from "@steeze-ui/heroicons";
    import FormInput from "$lib/components/FormInput.svelte";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import Filter from "$lib/components/filter/Filter.svelte";
    import { filterCompatible, type FilterQueryResult } from "$lib/components/filter/filter";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import { enhance } from "$app/forms";
    import type { SuppliersResponse } from "$lib/DBTypes";
    import Price from "$lib/components/formatters/Price.svelte";

    export let data: PageData;
    export let form: ActionData;
    
    let editList = false;
    let confirmDelete = false;
    let createOrder = false;

    let queryFilters: FilterQueryResult<"name" | "supplier" | "manufacturer" | "reference" | "valid"> = {};
    let filter: string = "";

    const listRowFilter = (nomRow: typeof data.nomenclature_rows[number], qf: typeof queryFilters): boolean => {

        let result = true;

        if(queryFilters.name !== undefined)
            result = result && filterCompatible(nomRow.expand?.child_article.name, queryFilters.name);
        if(queryFilters.reference !== undefined)
            result = result && filterCompatible(nomRow.expand?.child_article.reference, queryFilters.reference);
        if(queryFilters.supplier !== undefined)
            result = result && filterCompatible(nomRow.expand?.child_article.expand?.supplier?.name, queryFilters.supplier);
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

    $: invalidatedList = data.nomenclature_rows.filter(nr => {
        const list_row = data.list_rows.find(lr => lr.parent_nomenclature_row == nr.id);
        return nr.quantity_required !== list_row?.quantity;
    });

    const supplierFilter = (k: SuppliersResponse[] | undefined): k is SuppliersResponse[] => k !== undefined;
    const supplierDuplicates = (k: SuppliersResponse, i: number, a: Array<SuppliersResponse>) => a.findIndex(k2 => k2.id === k.id) === i

    $: suppliersInvalidated = invalidatedList.map(k => {
        return k.expand?.child_article.expand?.supplier;
    }).filter(supplierFilter).flatMap(k => k).filter(supplierDuplicates);

    $: if(confirmDelete) { setTimeout(() => confirmDelete = false, 5000); };

    export const snapshot: Snapshot<string> = {
        capture: () => filter,
        restore: (value: string) => filter = value
    }

</script>

<svelte:head>
    <title>Liste — {data.list.name}</title>
</svelte:head>

{#if editList}
    <form action="?/editList" method="post">
        <Flex direction="col" class="w-1/3">
            <FormInput label="Nom de la liste" labelMandatory={true} name="name" value={data.list.name}/>
            <FormInput type="select" label="Affaire" labelMandatory={false} name="project" value={data.list.project}>
                <option value={undefined}>—</option>
                {#each data.projects as project}
                    <option value={project.id}>{project.name}</option>
                {/each}
            </FormInput>   
            <Flex>
                <Button borderColor="border-emerald-500" hoverColor="hover:bg-emerald-500">Valider</Button>
                <Button borderColor="border-red-500" hoverColor="hover:bg-red-500" on:click={() => editList = false}>Annuler</Button>
            </Flex>
        </Flex>
    </form>
{:else}
    <h2>{data.list.name}</h2>
    <p>Nomenclature de base: <DetailLabel>{data.list.expand?.parent_nomenclature.name}</DetailLabel>.</p>
    {#if data.list.expand?.project} <p>Affaire: <DetailLabel>{data.list.expand?.project.name}</DetailLabel>.</p> {/if}
    <p>Montant restant pour terminer la liste: <DetailLabel> {remainingPrice} €</DetailLabel>.</p>
    <p>Articles validés: <DetailLabel>{remainingElements} / {data.nomenclature_rows.length}</DetailLabel>.</p>

    <button
        on:click={() => editList = true}
        class="mt-2 text-violet-500 hover:text-blue-500 duration-200"
    >
        <Icon src={Wrench} class="h-5 w-5 inline"/>
        Editer les informations
    </button>
{/if}

<Flex items="end">

    <Filter bind:filter availableFilters={["name", "manufacturer", "supplier", "reference", "valid"]} bind:filterResult={queryFilters}/>

    <Flex class="mt-6">
        <Button borderColor="border-emerald-500" hoverColor="hover:bg-emerald-500" on:click={() => {
            window.open(`/app/lists/${data.list.id}/export/`, '_blank')?.focus();
        }}>
            Export Excel
        </Button>

        <Button size="small" borderColor="border-pink-500" hoverColor="hover:bg-pink-500" on:click={() => 
            window.open(`/app/lists/print/?lists=${data.list.id}`, '_blank')?.focus()
        }>
            Imprimer l'etiquette
        </Button>

        {#if confirmDelete}
            <form action="?/removeList" method="post" use:enhanceNoReset>
                <Button borderColor="border-red-500" hoverColor="hover:bg-red-500">Etes vous sur ?</Button>
            </form>
        {:else}
            <Button borderColor="border-red-500" hoverColor="hover:bg-red-500" on:click={() => confirmDelete = true}>Supprimer la liste</Button>
        {/if}

        {#if createOrder}
            <form action="?/generateOrder" method="post" use:enhance class="flex flex-row gap-6 items-center">
                <input type="hidden" name="project" value={data.list.project} />
                <FormInput type="select" name="supplier" label="Fournisseur" labelMandatory={true}>
                    <option value={undefined}>—</option>
                    {#each suppliersInvalidated as supplier}
                        <option value={supplier.id}>{supplier.name}</option>
                    {/each}
                </FormInput>
                <Button>Générer la commande</Button>
            </form>
        {:else}
            <Button borderColor="border-blue-500" hoverColor="hover:bg-blue-500" on:click={() => createOrder = true}>Créer une commande</Button>
        {/if}
    </Flex>
</Flex>

<Table>
    <svelte:fragment slot="head">
        <TableHead>Éléments ({data.nomenclature_rows.filter((k) => listRowFilter(k , queryFilters)).length})</TableHead>
        <TableHead>Groupe</TableHead>
        <TableHead>Quantité</TableHead>
        <TableHead>Quantité nécéssaire</TableHead>
        <TableHead>Cout restant</TableHead>
        <TableHead>Validé</TableHead>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#if data.nomenclature_rows.length > 0}
            {#each data.nomenclature_rows.filter((k) => listRowFilter(k, queryFilters)) as row}
            
                {@const linked_row = data.list_rows.find(k => k.parent_nomenclature_row === row.id)}
                {@const isValid = row.quantity_required == linked_row?.quantity}
                {@const remainingQuantity = row.quantity_required - (linked_row?.quantity ?? 0)}

                <TableRow>
                    <TableCell><ArticleRow article={row.expand?.child_article} displayStock={true} /></TableCell>
                    <TableCell>{row.group}</TableCell>
                    <TableCell>
                        <form action="?/updateRow" method="post" use:enhanceNoReset>
                            <Flex gap={2} items="center">
                                {#if linked_row?.id !== undefined} <input type="hidden" name="id" value={linked_row?.id} /> {/if}
                                <input type="hidden" name="parent_nomenclature_row" value={row.id} />
                                <FormInput name="quantity" type="number" value={(linked_row?.quantity) ?? 0} min={0} max={row.quantity_required} backgroundColor="bg-white" />
                                <Button class="rounded-full self-center py-1 px-1"><Icon src={Check} class="h-4 w-4" /></Button>
                            </Flex>
                        </form>
                    </TableCell>
                    <TableCell>{row.quantity_required}</TableCell>
                    <TableCell>
                        <Price value={remainingQuantity * (row.expand?.child_article.price ?? 0)} />
                    </TableCell>
                    <TableCell><span class="font-semibold" class:text-red-500={!isValid} class:text-emerald-500={isValid}>{isValid ? "Complet" : "Incomplet"}</span></TableCell>
                </TableRow>
            {/each}
        {:else}
            <p class="p-6 font-medium text-lg">
                <Icon src={ExclamationTriangle} theme="solid" class="h-10 w-10 mr-2 text-orange-500 inline"/>
                Aucun élément présent dans la nomenclature.
            </p>
        {/if}
    </svelte:fragment>
</Table>
