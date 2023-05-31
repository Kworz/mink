<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import AssemblyPreview from "$lib/components/assemblies/AssemblyPreview.svelte";
    import Button from "$lib/components/Button.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import { clientSideFilter, type FilterCondition } from "$lib/components/filter/filter2";
    import Filter2 from "$lib/components/filter/Filter2.svelte";
    import Price from "$lib/components/formatters/Price.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { Check, DocumentChartBar, DocumentPlus, QrCode, WrenchScrewdriver } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";

    import { page } from "$app/stores";

    import type { ActionData, PageData, Snapshot } from "./$types";
    import { Collections } from "$lib/DBTypes";
    
    export let data: PageData;
    export let form: ActionData;

    let filters: Array<FilterCondition> = [];
    let filter: string = "";

    let createOrder = false;
    let editList = false;

    $: flatenRelations = data.flattenAssemblyResult.map((far) => {
        return {
            far: far,
            //buyListRelation: data.listItems.find(k => k.article === far.article.id)
            buyListRelation: data.storeRelations.find(k => k.article === far.article.id)
        }
    });

    $: if(form !== null && form.buyListRelationEdit?.success) { filter = ""; editList = false; invalidateAll(); setTimeout(() => { form = null; }, 2500) };
    $: if(form?.editList?.success) { editList = false; invalidateAll(); };

    export const snapshot: Snapshot<FilterCondition[]> = {
        capture: () => filters,
        restore: (value) => { filters = value; }
    }

</script>

<svelte:head>
    <title>Liste - {data.list.name}</title>
</svelte:head>

<Wrapper>
    <h3 class="mb-3">{data.list.name}</h3>

    <PillMenu>
        <PillMenuButton icon={WrenchScrewdriver} click={() => editList = !editList}>Modifier la liste d'achat</PillMenuButton>
        <PillMenuButton icon={DocumentPlus} click={() => createOrder = !createOrder}>Créer une commande</PillMenuButton>
        <PillMenuButton icon={DocumentChartBar} click={() => window.open(`/app/lists/${data.list.id}/export`, "_blank")?.focus()}>Exporter la liste</PillMenuButton>
        <PillMenuButton icon={QrCode} click={() => window.open(`/app/lists/print/?lists=${data.list.id}`, "_blank")?.focus()}>Imprimer l'etiquette</PillMenuButton>
    </PillMenu>

    {#if editList}
        <form action="?/editList" use:enhanceNoReset method="post" class="flex flex-row gap-4 items-end">
            <FormInput name="name" type="text" label="Nom" labelMandatory value={data.list.name} />

            {#await $page.data.pb.collection(Collections.Assemblies).getFullList() then assemblies}
                <FormInput name="assembly" type="select" label="Assemblage" labelMandatory value={data.list.assembly}>
                    {#each assemblies as assembly}
                        <option value={assembly.id}>{assembly.name}</option>
                    {/each}
                </FormInput>
            {/await}

            {#await $page.data.pb.collection(Collections.Projects).getFullList() then projects}
                <FormInput name="project" type="select" label="Affaire" value={data.list.project}>
                    <option value="">—</option>
                    {#each projects as project}
                        <option value={project.id}>{project.name}</option>
                    {/each}
                </FormInput>
            {/await}

            <FormInput name="closed" type="checkbox" label="Terminée" checked={data.list.closed} />

            <Button role="warning">Modifier</Button>
        </form>
    {:else}
        <p>Affaire: <DetailLabel>{data.list.expand?.project?.name}</DetailLabel>.</p>
        <p>Assemblage de base: <DetailLabel>{data.list.expand?.assembly?.name}</DetailLabel>.</p>
        <p>Manquant pour finaliser: <DetailLabel><Price value={flatenRelations.reduce((p, c) => p + ((c.far.article?.price ?? 0) * (c.far.quantity - (c.buyListRelation?.quantity ?? 0))), 0)}/></DetailLabel>.</p>
        <p>Terminée: <DetailLabel>{data.list.closed ? "Oui" : "Non"}</DetailLabel>.</p>
    {/if}


</Wrapper>


{#if createOrder}
    <Wrapper class="mt-6">
        <h4>Créer une commande</h4>
        <form action="?/generateOrder" method="post" use:enhance class="flex flex-col gap-4 md:flex-row md:items-end">
            <FormInput name="supplier" type="select" label="Fournisseur" labelMandatory>
                {#each data.suppliers as supplier}
                    <option value={supplier.id}>{supplier.name}</option>
                {/each}
            </FormInput>
            <Button>Créer la commande</Button>
        </form>
    </Wrapper>
{/if}

<Wrapper class="mt-6">
    <Filter2 bind:filter bind:filters availableFilters={[{name: "name", default: true}, { name: "quantity" }, { name: "manufacturer" }, { name: "reference" }, { name: "supplier.name" }, { name: "valid" }, { name: "stock" }]} />
    {@const tableData = flatenRelations.filter((element) => clientSideFilter(filters, {...element.far.article, quantity: element.far.quantity, valid: (element.buyListRelation?.quantity ?? 0) >= element.far.quantity, stock: element.far.article.quantity > 0 }))}
    <Table embeded={true}>
        <svelte:fragment slot="head">
            <TableHead>Article ({tableData.length})</TableHead>
            <TableHead>Sous assemblages</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Quantité nécessaire</TableHead>
            <TableHead>Prix restant / total</TableHead>
            <TableHead>Validé ?</TableHead>
        </svelte:fragment>
        <svelte:fragment slot="body">
            {#each tableData as far}

                <TableRow>
                    <TableCell><ArticleRow article={far.far.article} displayStock displayApprox /></TableCell>
                    <TableCell>
                        <Flex direction={far.far.subAssemblies.length > 1 ? "row" : "col"} gap={2} items={far.far.subAssemblies.length > 1 ? "center" : undefined}>
                            {#each far.far["subAssemblies"] as assembly}
                                <AssemblyPreview {assembly} imageSize="h-10" minimized={far.far.subAssemblies.length > 1}/>
                            {/each}
                        </Flex>
                    </TableCell>
                    <TableCell>
                        <form action="?/buyListRelationEdit" method="post" use:enhanceNoReset class="flex gap-4 items-center">

                            {#if form?.buyListRelationEdit?.[far.far.article.id]}
                                {@const data = form.buyListRelationEdit[far.far.article.id]}

                                {#if data.storesToGetFrom !== undefined}
                                    <FormInput type="select" name="store" label="Choisir un stock de provenance" labelMandatory>
                                        {#each data.storesToGetFrom as store}
                                            <option value={store.id}>{store.name}</option>
                                        {/each}
                                    </FormInput>
                                {/if}

                                {#if data.storesToSendTo !== undefined}
                                    <FormInput type="select" name="store" label="Choisir un stock de destination">
                                        {#each data.storesToSendTo as store}
                                            <option value={store.id}>{store.name}</option>
                                        {/each}
                                    </FormInput>
                                {/if}
                            {/if}

                            <input type="hidden" name="article" value={far.far.article.id} />
                            <input type="hidden" name="buylist" value={data.list.id} />
                            <FormInput name="quantity" type="number" step={far.far.article.unit === "" ? 1 : 0.1} value={far.buyListRelation?.quantity ?? 0} max={far.far.quantity} invalid={form?.buyListRelationEdit[`${far.far.article.id}`]?.error !== undefined} label={form?.buyListRelationEdit[`${far.far.article.id}`]?.error ?? (form?.buyListRelationEdit[`${far.far.article.id}`]?.success ?? undefined)} />
                            <Button size="small"><Icon src={Check} class="h-4 w-4"/></Button>
                        </form>
                    </TableCell>
                    <TableCell>{far.far.quantity}</TableCell>
                    <TableCell><Price value={(far.far.quantity - (far.buyListRelation?.quantity ?? 0)) * (far.far.article.price ?? 0)} /> / <Price value={far.far.quantity * (far.far.article.price ?? 0)} /></TableCell>
                    <TableCell>
                        {@const isValid = far.far.quantity <= (far.buyListRelation?.quantity ?? 0)}
                        <span class="font-semibold {isValid ? "text-emerald-500" : "text-red-500"}">{isValid ? "Oui" : "Non"}</span>
                    </TableCell>
                </TableRow>
            {/each}
        </svelte:fragment>
    </Table>
</Wrapper>