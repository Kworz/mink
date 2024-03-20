<script lang="ts">
    import { enhance } from "$app/forms";
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import DetailLabel from "$lib/components/generics/DetailLabel.svelte";
    import RoundedLabel from "$lib/components/generics/RoundedLabel.svelte";
    import Price from "$lib/components/generics/formatters/Price.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { Check, DocumentChartBar, DocumentPlus, QrCode, WrenchScrewdriver } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { ActionData, PageData } from "./$types";
    import { computeArticlePrice } from "$lib/components/derived/article/article";
    import { page } from "$app/stores";
    import Filter from "$lib/components/derived/filter/Filter.svelte";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { _ } from "svelte-i18n";
    
    export let data: PageData;
    export let form: ActionData;

    let filter = $page.url.searchParams.has("articleFilter") ? JSON.parse(decodeURIComponent($page.url.searchParams.get("articleFilter")!)) : {};
    let sort = $page.url.searchParams.has("articleSort") ? JSON.parse(decodeURIComponent($page.url.searchParams.get("articleSort") as string)) : {};

    let editList = false;

    $: if(form !== null && form.buyListRelationEdit?.success) { setTimeout(() => { form = null; }, 3000) };
    //$: if(form?.generateFabOrders) { alert(form?.generateFabOrders.error ?? "no error given"); invalidateAll(); }
    $: if(form?.editList?.success) { editList = false; };

    const refresh = () => { if(browser) goto(`?articleFilter=${encodeURIComponent(JSON.stringify(filter))}&articleSort=${encodeURIComponent(JSON.stringify(sort))}`); }

    $: filter, sort, refresh();

</script>

<svelte:head>
    <title>Liste - {data.list.name}</title>
</svelte:head>

{#if editList}
    <MenuSide on:close={() => editList = false} title="Modifier la liste d'achat">

        <form action="?/editList" use:enhanceNoReset method="post" class="flex flex-col gap-4">

            <FormInput name="name" type="text" label={$_('app.generic.name')} required value={data.list.name} />

            <FormInput name="assembly" type="select" label={$_('app.generic.assembly')} required value={data.list.assembly_id}>
                {#each data.assemblies as assembly}
                    <option value={assembly.id}>{assembly.name}</option>
                {/each}
            </FormInput>

            <FormInput name="project" type="select" label={$_('app.generic.project')} value={data.list.project_id}>
                <option value="">—</option>
                {#each data.projects as project}
                    <option value={project.id}>{project.name}</option>
                {/each}
            </FormInput>

            <FormInput name="closed" type="checkbox" label={$_('app.generic.terminated')} checked={data.list.closed} />

            <Button role="warning">{$_('app.action.update')}</Button>
        </form>
    </MenuSide>
{/if}

<PillMenu>
    <PillMenuButton icon={WrenchScrewdriver} click={() => editList = !editList}>Modifier la liste d'achat</PillMenuButton>
    <form action="?/generateFabOrders" method="post" use:enhance>
        <PillMenuButton icon={DocumentPlus}>Créer les ordres de manufacturing</PillMenuButton>
    </form>
    <PillMenuButton icon={DocumentChartBar} click={() => window.open(`/app/scm/lists/${data.list.id}/export`, "_blank")?.focus()}>Exporter la liste</PillMenuButton>
    <PillMenuButton icon={QrCode} click={() => window.open(`/app/scm/lists/print/?lists=${data.list.id}`, "_blank")?.focus()}>Imprimer l'etiquette</PillMenuButton>
</PillMenu>

<h1>{data.list.name}</h1>

<p>Affaire: <DetailLabel>{data.list.project?.name ?? "—"}</DetailLabel>.</p>
<p>Assemblage de base: <DetailLabel>{data.list.assembly.name}</DetailLabel>.</p>
<p>Terminée: <DetailLabel>{$_('app.generic.boolean-other.' + data.list.closed)}</DetailLabel>.</p>

<Filter class="my-6" bind:filter availableFilters={[
    { name: "name", default: true, type: "string" },
    { name: "reference", type: "string" },
    { name: "brand", type: "string" },
    { name: "critical_quantity", type: "number" },
    { name: "consumable", type: "boolean" }]}
/>
    
<Table
    headers={[{ label: `${$_('app.generic.article')} (${data.articles.length})`, colname: "name" }, { label: $_('app.generic.quantity') }, { label: $_('app.generic.required_quantity') }, { label: "Prix restant / total" }, { label: "Validé ?" }]}
    bind:sort={sort}
>
    {#each data.articles as article}

        {@const associatedStoreRelation = data.listStoreRelations.find(lsr => lsr.article_id === article.id)}

        {@const storeQuantity = associatedStoreRelation?.quantity ?? 0}
        {@const requiredQuantity = data.flattenedAssembly[article.id].requiredQuantity - storeQuantity}

        {@const requiredPrice = (requiredQuantity - storeQuantity) * computeArticlePrice(article.order_rows)}        
        {@const totalPrice = requiredQuantity * computeArticlePrice(article.order_rows)}
        {@const isValid = requiredQuantity <= storeQuantity}

        {@const formData = (form?.buyListRelationEdit?.article === article.id) ? form.buyListRelationEdit : undefined}

        <TableCell><ArticleRow article={article} displayStock displayInboundSupplies /></TableCell>
        <TableCell>
            <form action="?/buyListRelationEdit" method="post" use:enhanceNoReset class="flex gap-4 items-center">

                {#if data}
                    {#if "storesToGetFrom" in data}
                        <FormInput type="select" name="store" label="Choisir un stock de provenance" required>
                            {#each formData.storesToGetFrom as store}
                                <option value={store.id}>{store.name}</option>
                            {/each}
                        </FormInput>
                    {/if}

                    {#if "storesToSendTo" in data}
                        <FormInput type="select" name="store" label="Choisir un stock de destination">
                            {#each formData.storesToSendTo as store}
                                <option value={store.id}>{store.name}</option>
                            {/each}
                        </FormInput>
                    {/if}
                {/if}

                <input type="hidden" name="article" value={article.id} />
                <FormInput name="quantity" type="number" step={article.unit_quantity} 
                    max={requiredQuantity} 
                    value={formData?.quantity ?? associatedStoreRelation?.quantity ?? 0}
                    invalid={formData?.error !== undefined} 
                    label={formData?.error ?? formData?.success ?? undefined} 
                />
                <Button size="small"><Icon src={Check} class="h-4 w-4"/></Button>
            </form>
        </TableCell>
        <TableCell>{requiredQuantity}</TableCell>
        <TableCell><Price value={requiredPrice} /> / <Price value={totalPrice} /></TableCell>
        <TableCell><RoundedLabel role={isValid ? "success" : "danger"}>{$_('app.generic.boolean-other.' + isValid)}</RoundedLabel></TableCell>
    {/each}
</Table>
