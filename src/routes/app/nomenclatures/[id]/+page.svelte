<script lang="ts">
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import type { ActionData, PageData, Snapshot } from "./$types";

    import { Icon } from "@steeze-ui/svelte-icon";
    import { Check, DocumentDuplicate, ExclamationTriangle, Wrench } from "@steeze-ui/heroicons";
    import FormInput from "$lib/components/FormInput.svelte";
    import type { NomenclatureRowResponseExpanded } from "./+page.server";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import Filter from "$lib/components/filter/Filter.svelte";
    import { filterCompatible, type FilterQueryResult } from "$lib/components/filter/filter";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import Price from "$lib/components/formatters/Price.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";

    export let data: PageData;
    export let form: ActionData;
    
    let editNomenclature = false;

    let currentFilter = "";
    let queryFilters: Partial<FilterQueryResult<"name" | "supplier" | "manufacturer" | "reference" | "group" | "price">> = {};

    const listRowFilter = (nomRow: NomenclatureRowResponseExpanded, qf: typeof queryFilters): boolean => {

        let result = true;

        if(nomRow.expand === undefined)
            return false;

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
        if(queryFilters.price !== undefined)
            result = result && filterCompatible(String(nomRow.expand?.child_article.price), queryFilters.price)

        return result;
    }

    export const snapshot: Snapshot<string> = {
        capture: () => currentFilter,
        restore: (value) => (currentFilter = value)
    }

    $: if(form?.success === true && browser) { invalidateAll(); }

    let menuPillShown = false;

</script>

<svelte:head><title>Nomenclature — {data.nomenclature.name}</title></svelte:head>

<Wrapper>

    <PillMenu bind:open={menuPillShown}>
        <PillMenuButton icon={Wrench} on:click={() => { editNomenclature = true; menuPillShown = false;}}>Modifier les informations</PillMenuButton>
        <form action="?/copyNomenclature" method="post" use:enhanceNoReset>
            <PillMenuButton role="warning" icon={DocumentDuplicate}>Copier la nomenclature</PillMenuButton>
        </form>
    </PillMenu>

    {#if editNomenclature}
        <form action="?/editNomenclature" method="post" use:enhanceNoReset>
    
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
        {#if data.nomenclature.expand?.['nomenclature_row(parent_nomenclature)'] !== undefined}
            <p>Cout estimé de la nomenclature:
                <DetailLabel>
                    <Price value={data.nomenclature.expand?.['nomenclature_row(parent_nomenclature)'].reduce((p, c) => p + (c.expand?.child_article.price ?? 0) * c.quantity_required, 0)} />
                </DetailLabel>
            </p>
        {/if}
    {/if}
</Wrapper>

<Wrapper class="mt-6">
    <Filter bind:filter={currentFilter} availableFilters={["name", "manufacturer", "supplier", "reference", "group", "price"]} bind:filterResult={queryFilters} />

    <Table embeded={true}>
        <svelte:fragment slot="head">
            <TableHead>
                Éléments
                {#if data.nomenclature.expand?.['nomenclature_row(parent_nomenclature)'] !== undefined}
                    ({data.nomenclature.expand['nomenclature_row(parent_nomenclature)'].filter(k => listRowFilter(k, queryFilters)).length})
                {/if} 
            </TableHead>
            <TableHead>Groupe</TableHead>
            <TableHead>Quantité nécéssaire</TableHead>
            <TableHead>Supprimer</TableHead>
        </svelte:fragment>
    
        <svelte:fragment slot="body">
            {#if data.nomenclature.expand?.['nomenclature_row(parent_nomenclature)'] !== undefined}
                {#each data.nomenclature.expand['nomenclature_row(parent_nomenclature)'].filter(k => listRowFilter(k, queryFilters)) as row}
                    <TableRow>
                        <TableCell>
                            {#if row.expand?.child_article !== undefined}
                                <ArticleRow article={row.expand?.child_article} />
                            {:else}
                                <span class="text-red-500">Failed to load Article data.</span>
                            {/if}
                        </TableCell>
                        <TableCell>
                            <form action="?/editItem" method="post" use:enhanceNoReset>
                                <input type="hidden" id="row_id" value={row.id} name="row_id"/>
                                <Flex items="center">
                                    <FormInput type="text" name="group" bind:value={row.group} backgroundColor="bg-white" />
                                    <Button size="small"><Icon src={Check} class="h-4 w-4"/></Button>
                                </Flex>
                                
                            </form>
                        </TableCell>
                        <TableCell>
                            <form action="?/editItem" method="post" use:enhanceNoReset>
                                <input type="hidden" id="row_id" value={row.id} name="row_id"/>
                                <Flex items="center">
                                    <FormInput type="number" name="quantity_required" bind:value={row.quantity_required} backgroundColor="bg-white" />
                                    <Button size="small"><Icon src={Check} class="h-4 w-4"/></Button>
                                </Flex>
                            </form>
                        </TableCell>
                        <TableCell>
                            <form action="?/deleteItem" method="post" use:enhanceNoReset>
                                <input type="hidden" id="row_id" value={row.id} name="row_id"/>
                                <Button borderColor="border-red-500" hoverColor="hover:bg-red-500" size="small">Supprimer</Button>
                            </form>
                        </TableCell>
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
</Wrapper>
 