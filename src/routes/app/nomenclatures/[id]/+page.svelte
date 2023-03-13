<script lang="ts">
    import { browser } from "$app/environment";
    import { goto, invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import type { ActionData, PageData, Snapshot } from "./$types";

    import { Icon } from "@steeze-ui/svelte-icon";
    import { Check, DocumentDuplicate, ExclamationTriangle, PlusCircle, Wrench } from "@steeze-ui/heroicons";
    import FormInput from "$lib/components/FormInput.svelte";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import Price from "$lib/components/formatters/Price.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import ArticleFinder from "$lib/components/article/ArticleFinder.svelte";
    import { enhance } from "$app/forms";
    import { page } from "$app/stores";
    import type { FilterCondition } from "$lib/components/filter/filter2";
    import Filter2 from "$lib/components/filter/Filter2.svelte";

    export let data: PageData;
    export let form: ActionData;
    
    let menuPillShown = false;
    let editNomenclature = false;
    let addToNomenclature = false;

    let activeSort = $page.url.searchParams.get("sort") || undefined;

    let filters: Array<FilterCondition> = [];
    let filter: string = "";

    export const snapshot: Snapshot<Array<FilterCondition>> = {
        capture: () => filters,
        restore: (value) => (filters = value)
    }

    $: if(form?.success === true && browser) { invalidateAll(); }
    $: filter, activeSort, () => {
        if(browser)
        {
            goto(`/app/nomenclatures/${data.nomenclature.id}/?sort=${activeSort}&filter=${filter}`);
        }
    }
</script>

<svelte:head><title>Nomenclature — {data.nomenclature.name}</title></svelte:head>

<Wrapper class="relative z-50">
    <PillMenu bind:open={menuPillShown}>
        <PillMenuButton icon={Wrench} on:click={() => { editNomenclature = true; menuPillShown = false;}}>Modifier les informations</PillMenuButton>
        <PillMenuButton icon={PlusCircle} on:click={() => { addToNomenclature = !addToNomenclature; menuPillShown = false}}>Ajouter des articles</PillMenuButton>
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
                    <Button role="success">Valider</Button>
                    <Button role="danger" on:click={() => editNomenclature = false}>Annuler</Button>
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

{#if addToNomenclature === true}
    <Wrapper class="mt-6">
        <form action="?/addItem" method="post" use:enhance>

            <ArticleFinder formFieldName="child_article" />
            <Flex gap={6} class="mt-6" items="end">
                <FormInput type="number" name="quantity_required" label="Quantité requise" labelMandatory={true} min={0} />
                <Button role="primary">Ajouter</Button>
            </Flex>
        </form>
    </Wrapper>
{/if}

<Wrapper class="mt-6">
    <Filter2 bind:filters bind:filter availableFilters={[]} />

    <Table embeded={true}>
        <svelte:fragment slot="head">
            <TableHead colWidth="w-2/3 md:w-1/2">
                Éléments
                {#if data.nomenclature.expand?.['nomenclature_row(parent_nomenclature)'] !== undefined}
                    ({data.nomenclature.expand['nomenclature_row(parent_nomenclature)'].length})
                {/if} 
            </TableHead>
            <TableHead>Groupe</TableHead>
            <TableHead col="nomenclature_row(parent_nomenclature).quantity_required" bind:activeSort>Quantité nécéssaire</TableHead>
            <TableHead>Supprimer</TableHead>
        </svelte:fragment>
    
        <svelte:fragment slot="body">
            {#if data.nomenclature.expand?.['nomenclature_row(parent_nomenclature)'] !== undefined}
                {#each data.nomenclature.expand['nomenclature_row(parent_nomenclature)'] as row}
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
                                <Button role="danger" size="small">Supprimer</Button>
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
 