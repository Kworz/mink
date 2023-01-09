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
    import Input from "$lib/components/Input.svelte";
    import type { NomenclatureRowResponse } from "$lib/DBTypes";
    import { enhance } from "$app/forms";

    export let data: PageData;
    export let form: ActionData;
    
    let editList = false;
    let filterHelp = false;
    let confirmDelete = false;

    let filter: string = "";
    let nameFilter: string | undefined = undefined;
    let supplierFilter: string | undefined = undefined;
    let manufacturerFilter: string | undefined = undefined;
    let referenceFilter: string | undefined = undefined;
    let validFilter: boolean | undefined = undefined;

    const computeFilters = () => {
        const filterQueries = filter.split(" && ");

        supplierFilter = filterQueries.find(k => k.startsWith("supplier:"))?.replace("supplier:", "");
        manufacturerFilter = filterQueries.find(k => k.startsWith("manufacturer:"))?.replace("manufacturer:", "");
        referenceFilter = filterQueries.find(k => k.startsWith("reference:"))?.replace("reference:", "");

        const validQuery = filterQueries.find(k => k.startsWith("valid:"))?.replace("valid:", "")
        validFilter =  validQuery === undefined ? undefined : validQuery === "true";

        nameFilter = filterQueries.find(k => !k.includes(":"));
    }

    const listRowFilter = (nomRow: NomenclatureRowResponse, filter: string): boolean => {

        let result = true;

        if(nameFilter)
            result = result && nomRow.expand?.child_article.name.toLowerCase().includes(nameFilter.toLowerCase())
        if(referenceFilter)
            result = result && nomRow.expand?.child_article.reference.toLowerCase().includes(referenceFilter.toLowerCase());
        if(supplierFilter)
            result = result && nomRow.expand?.child_article.supplier.toLowerCase().includes(supplierFilter.toLowerCase());
        if(manufacturerFilter)
            result = result && nomRow.expand?.child_article.manufacturer.toLowerCase().includes(manufacturerFilter.toLowerCase());

        if(validFilter !== undefined)
        {
            const list_row_reference = data.list_rows.find(listRow => listRow.parent_nomenclature_row === nomRow.id);
            const isRowValid = nomRow.quantity_required === (list_row_reference?.quantity ?? 0);

            if(validFilter === true)
                result = result && isRowValid;
            else
                result = result && !isRowValid;
        }

        return result;
    }

    $: if(form?.success === true && browser) { invalidateAll(); }
    
    $: filter, computeFilters();
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

{#if filterHelp}
    <div class="mt-6 p-4 bg-zinc-100 rounded-sm border border-zinc-500/50">
    
        <h4 class="leading-10">Filtres de recherche</h4>
    
        <p>Entrez le nom de l'élément recherché dans la zone de recherche. Vous pouvez aussi rechercher par fournisseur en utilisant le préfixe <b>supplier:Nom du founisseur</b>.</p>
        <p>Il est possible de combiner plusieurs filtres en délimitant les filtres avec " && ".</p>

        <span class="my-2 block">Les filtres suivants sont disponibles:</span>
        <ul style="list-style:disc; margin-left: 2rem;">
            <li>supplier:[Nom du fournisseur]</li>
            <li>reference:[référence article]</li>
            <li>manufacturer:[Nom du fabricant]</li>
            <li>valid:[true/false]</li>
        </ul>
    </div>
{/if}

<Flex class="mt-6">
    <Input bind:value={filter} placeholder={"Filtre"}/>
    <Button on:click={() => filterHelp = !filterHelp}>{!filterHelp ? "Aide filtres" : "Masquer aide filtres"}</Button>
    <a href="/app/lists/{data.list.id}/export"><Button borderColor="border-emerald-500" hoverColor="hover:bg-emerald-500">Export Excel</Button></a>
    {#if confirmDelete}
        <form action="?/removeList" method="post" use:enhance>
            <Button borderColor="border-red-500" hoverColor="hover:bg-red-500">Etes vous sur ?</Button>
        </form>
    {:else}
        <Button borderColor="border-red-500" hoverColor="hover:bg-red-500" on:click={() => confirmDelete = true}>Supprimer la liste.</Button>
    {/if}
</Flex>

<Table>
    <svelte:fragment slot="head">
        <tr>
            <th>Éléments ({data.nomenclature_rows.filter((k) => listRowFilter(k , filter)).length})</th>
            <th>Groupe</th>
            <th>Quantité</th>
            <th>Quantité nécéssaire</th>
            <th>Cout restant</th>
            <th>Validé</th>
        </tr>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#if data.nomenclature_rows.length > 0}
            {#each data.nomenclature_rows.filter((k) => listRowFilter(k, filter)) as row}
                {@const linked_row = data.list_rows.find(k => k.parent_nomenclature_row === row.id)}
                {@const isValid = row.quantity_required == linked_row?.quantity}
                {@const remainingQuantity = row.quantity_required - (linked_row?.quantity ?? 0)}
                <tr>    
                    <td>
                        <a href="/app/articles/{row.expand?.child_article.id}" class="block font-medium hover:text-violet-500">{row.expand?.child_article.name}</a>
                        <span class="text-sm block">{row.expand?.child_article.manufacturer}: {row.expand?.child_article.reference}</span>
                        <span class="text-sm">{row.expand?.child_article.supplier}: {row.expand?.child_article.price} €</span>
                    </td>
                    <td>{row.group}</td>
                    <td>
                        <form action="?/updateRow" method="post" use:enhance>
                            <Flex gap={2}>
                                {#if linked_row?.id !== undefined} <input type="hidden" name="id" value={linked_row?.id} /> {/if}
                                <input type="hidden" name="parent_nomenclature_row" value={row.id} />
                                <FormInput name="quantity" type="number" value={(linked_row?.quantity) ?? 0} min={0} max={row.quantity_required} />
                                <Button><Icon src={Check} class="h-6 w-6" /></Button>
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