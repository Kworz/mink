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
    import Table from "$lib/components/table2/Table.svelte";
    import TableCell from "$lib/components/table2/TableCell.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { Check, DocumentChartBar, DocumentPlus, QrCode, WrenchScrewdriver } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";

    import { page } from "$app/stores";

    import type { ActionData, PageData, Snapshot } from "./$types";
    import { Collections } from "$lib/DBTypes";
    import RoundedLabel from "$lib/components/RoundedLabel.svelte";
    import { onMount } from "svelte";
    
    export let data: PageData;
    export let form: ActionData;

    let filters: Array<FilterCondition> = [];
    let filter: string = "";

    let createOrder = false;
    let editList = false;

    onMount(async () => {
        const unsub = await $page.data.pb.collection(Collections.StoresRelations).subscribe(data.list.store, () => invalidateAll());

        return () => unsub();
    })

    $: flatenRelations = data.flattenAssemblyResult.map((far) => {
        return {
            far: far,
            buyListRelation: data.storeRelations.find(k => k.article === far.article.id)
        }
    });

    $: if(form !== null && form.buyListRelationEdit?.success) { filter = ""; editList = false; invalidateAll(); setTimeout(() => { form = null; }, 2500) };
    $: if(form?.editList?.success) { editList = false; invalidateAll(); };
    $: if(form?.generateFabOrders) { alert(form?.generateFabOrders.error ?? "no error given"); invalidateAll(); }

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
        <form action="?/generateFabOrders" method="post" use:enhance>
            <PillMenuButton icon={DocumentPlus}>Créer les ordres de fabrication</PillMenuButton>
        </form>
        <PillMenuButton icon={DocumentChartBar} click={() => window.open(`/app/scm/lists/${data.list.id}/export`, "_blank")?.focus()}>Exporter la liste</PillMenuButton>
        <PillMenuButton icon={QrCode} click={() => window.open(`/app/scm/lists/print/?lists=${data.list.id}`, "_blank")?.focus()}>Imprimer l'etiquette</PillMenuButton>
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
        <p>Manquant pour finaliser: 
            <DetailLabel>
                <Price value={flatenRelations.reduce((p, c) => p + ((c.far.article.expand?.["article_price(article)"]?.at(0)?.price ?? c.far.article?.price ?? 0) * (c.far.quantity - (c.buyListRelation?.quantity ?? 0))), 0)}/>
            </DetailLabel>.
        </p>
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
    <Filter2 bind:filter bind:filters availableFilters={[{name: "name", default: true, type: "string" }, { name: "quantity", type: "number" }, { name: "manufacturer", type: "string" }, { name: "reference", type: "string" }, { name: "supplier.name", type: "array" }, { name: "valid", type: "boolean" }, { name: "stock", type: "boolean" }, { name: "required_quantity", type: "number" }]} />
    
    {@const assemblyRelations = flatenRelations.filter((element) => clientSideFilter(filters, {...element.far.article, quantity: (element.buyListRelation?.quantity ?? 0), required_quantity: element.far.quantity, valid: (element.buyListRelation?.quantity ?? 0) >= element.far.quantity, stock: (element.far.article.expand?.["article_store_quantity(article)"]?.at(0)?.quantity ?? 0) > 0 }))}
    
    <Table
        class="mt-6"
        headers={[{ label: `Article (${assemblyRelations.length})`, colname: "name" }, { label: "Sous-assemblages" }, { label: "Quantité" }, { label: "Quantité nécessaire" }, { label: "Prix restant / total" }, { label: "Validé ?" }, { label: "Outils" }]}
    >
        {#each assemblyRelations as assemblyRelation}

            {@const requiredQuantity = assemblyRelation.far.quantity - (assemblyRelation.buyListRelation?.quantity ?? 0)}
            {@const requiredPrice = requiredQuantity * (assemblyRelation.far.article.expand?.["article_price(article)"]?.at(0)?.price ?? assemblyRelation.far.article.price ?? 0)}
            {@const totalPrice = assemblyRelation.far.quantity * (assemblyRelation.far.article.expand?.["article_price(article)"]?.at(0)?.price ?? assemblyRelation.far.article.price ?? 0)}
            {@const isValid = assemblyRelation.far.quantity <= (assemblyRelation.buyListRelation?.quantity ?? 0)}

            {@const replacements = data.buyListReplacementRelations.filter(k => k.base_article === assemblyRelation.far.article.id)}

            <TableCell><ArticleRow article={assemblyRelation.far.article} displayStock displayApprox /></TableCell>
            <TableCell>
                <Flex direction={assemblyRelation.far.subAssemblies.length > 1 ? "row" : "col"} gap={2} items={assemblyRelation.far.subAssemblies.length > 1 ? "center" : undefined}>
                    {#each assemblyRelation.far["subAssemblies"] as assembly}
                        <AssemblyPreview {assembly} imageSize="h-10" minimized={assemblyRelation.far.subAssemblies.length > 1}/>
                    {/each}
                </Flex>
            </TableCell>
            <TableCell>
                <form action="?/buyListRelationEdit" method="post" use:enhanceNoReset class="flex gap-4 items-center">

                    {#if form?.buyListRelationEdit?.[assemblyRelation.far.article.id]}
                        {@const data = form.buyListRelationEdit[assemblyRelation.far.article.id]}

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

                    <input type="hidden" name="article" value={assemblyRelation.far.article.id} />
                    <input type="hidden" name="buylist" value={data.list.id} />
                    <FormInput name="quantity" type="number" step={assemblyRelation.far.article.unit === "" ? 1 : 0.1} value={assemblyRelation.buyListRelation?.quantity ?? 0} max={assemblyRelation.far.quantity} invalid={form?.buyListRelationEdit[`${assemblyRelation.far.article.id}`]?.error !== undefined} label={form?.buyListRelationEdit[`${assemblyRelation.far.article.id}`]?.error ?? (form?.buyListRelationEdit[`${assemblyRelation.far.article.id}`]?.success ?? undefined)} />
                    <Button size="small"><Icon src={Check} class="h-4 w-4"/></Button>
                </form>
            </TableCell>
            <TableCell>{assemblyRelation.far.quantity}</TableCell>
            <TableCell><Price value={requiredPrice} /> / <Price value={totalPrice} /></TableCell>
            <TableCell><RoundedLabel role={isValid ? "success" : "danger"}>{isValid ? "Oui" : "Non"}</RoundedLabel></TableCell>
            <TableCell>Ajouter un article de remplacement</TableCell>

            {#if replacements.length > 0}
                <TableCell colspan={7}><span class="text-orange-500">Articles de remplacement</span></TableCell>
            {/if}

            {#each replacements as replacement}
                <TableCell class="pl-12">
                    <ArticleRow article={replacement.expand?.replacement_article} />
                </TableCell>
                <TableCell colspan={6}>{replacement.quantity}</TableCell>
            {/each}
        {/each}
    </Table>
</Wrapper>