<script lang="ts">
    import { enhance } from "$app/forms";
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";
    import { type FilterCondition } from "$lib/components/derived/filter/filter2";
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
    import type { ActionData, PageData, Snapshot } from "./$types";
    import type { scm_store } from "@prisma/client";
    
    export let data: PageData;
    export let form: ActionData | { buyListRelationEdit: { article: { [x:string]: ({ storesToGetFrom: scm_store[] } | { storesToSendTo: scm_store[]})}}}; // issue in sveltekit because of typescript https://github.com/sveltejs/kit/issues/9727

    let filters: Array<FilterCondition> = [];
    let filter: string = "";

    let editList = false;

    //$: if(form !== null && form.buyListRelationEdit?.success) { filter = ""; editList = false; invalidateAll(); setTimeout(() => { form = null; }, 2500) };
    //$: if(form?.editList?.success) { editList = false; invalidateAll(); };
    //$: if(form?.generateFabOrders) { alert(form?.generateFabOrders.error ?? "no error given"); invalidateAll(); }

    export const snapshot: Snapshot<FilterCondition[]> = {
        capture: () => filters,
        restore: (value) => { filters = value; }
    }

</script>

<svelte:head>
    <title>Liste - {data.list.name}</title>
</svelte:head>

{#if editList}
    <MenuSide on:close={() => editList = false} title="Modifier la liste d'achat">

        <form action="?/editList" use:enhanceNoReset method="post" class="flex flex-col gap-4">

            <FormInput name="name" type="text" label="Nom" labelMandatory value={data.list.name} />

            <FormInput name="assembly" type="select" label="Assemblage" labelMandatory value={data.list.assembly_id}>
                {#each data.assemblies as assembly}
                    <option value={assembly.id}>{assembly.name}</option>
                {/each}
            </FormInput>

            <FormInput name="project" type="select" label="Affaire" value={data.list.project_id}>
                <option value="">—</option>
                {#each data.projects as project}
                    <option value={project.id}>{project.name}</option>
                {/each}
            </FormInput>

            <FormInput name="closed" type="checkbox" label="Terminée" checked={data.list.closed} />

            <Button role="warning">Modifier</Button>
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

<p>Affaire: <DetailLabel>{data.list.project?.name}</DetailLabel>.</p>
<p>Assemblage de base: <DetailLabel>{data.list.assembly.name}</DetailLabel>.</p>
<p>Terminée: <DetailLabel>{data.list.closed ? "Oui" : "Non"}</DetailLabel>.</p>
    
<Table
    class="mt-6"
    headers={[{ label: `Article (${data.assemblyRows.length})`, colname: "name" }, { label: "Quantité" }, { label: "Quantité nécessaire" }, { label: "Prix restant / total" }, { label: "Validé ?" }]}
>
    {#each data.assemblyRows as assemblyRelation}

        {@const associatedStoreRelation = data.listStoreRelations.find(lsr => lsr.article_id === assemblyRelation.article_child_id)}

        {@const requiredQuantity = assemblyRelation.quantity - (associatedStoreRelation?.quantity ?? 0)}
        {@const requiredPrice = requiredQuantity * assemblyRelation.article_child.order_rows.reduce((p, c) => p = (c.ack_price ?? 0) + p, 0)}        
        {@const totalPrice = assemblyRelation.quantity * assemblyRelation.article_child.order_rows.reduce((p, c) => p = (c.ack_price ?? 0) + p, 0)}
        {@const isValid = assemblyRelation.quantity <= (associatedStoreRelation?.quantity ?? 0)}

        <TableCell><ArticleRow article={assemblyRelation.article_child} displayStock displayInboundSupplies /></TableCell>
        <TableCell>
            <form action="?/buyListRelationEdit" method="post" use:enhanceNoReset class="flex gap-4 items-center">

                {#if form?.buyListRelationEdit !== undefined && "article" in form.buyListRelationEdit}
                    {@const data = form.buyListRelationEdit.article[assemblyRelation.article_child_id]}

                    {#if "storesToGetFrom" in data}
                        <FormInput type="select" name="store" label="Choisir un stock de provenance" labelMandatory>
                            {#each data.storesToGetFrom as store}
                                <option value={store.id}>{store.name}</option>
                            {/each}
                        </FormInput>
                    {/if}

                    {#if "storesToSendTo" in data}
                        <FormInput type="select" name="store" label="Choisir un stock de destination">
                            {#each data.storesToSendTo as store}
                                <option value={store.id}>{store.name}</option>
                            {/each}
                        </FormInput>
                    {/if}
                {/if}

                <input type="hidden" name="article" value={assemblyRelation.article_child_id} />
                <input type="hidden" name="buylist" value={data.list.id} />
                <FormInput name="quantity" type="number" step={assemblyRelation.article_child.unit ? 1 : 0.01} 
                    max={assemblyRelation.quantity} 
                    value={form?.buyListRelationEdit?.article[`${assemblyRelation.article_child_id}`]?.quantity ?? associatedStoreRelation?.quantity ?? 0}
                    invalid={form?.buyListRelationEdit?.article[`${assemblyRelation.article_child_id}`]?.error !== undefined} 
                    label={form?.buyListRelationEdit?.article[`${assemblyRelation.article_child_id}`]?.error ?? (form?.buyListRelationEdit?.article[`${assemblyRelation.article_child_id}`]?.success ?? undefined)} 
                />
                <Button size="small"><Icon src={Check} class="h-4 w-4"/></Button>
            </form>
        </TableCell>
        <TableCell>{assemblyRelation.quantity}</TableCell>
        <TableCell><Price value={requiredPrice} /> / <Price value={totalPrice} /></TableCell>
        <TableCell><RoundedLabel role={isValid ? "success" : "danger"}>{isValid ? "Oui" : "Non"}</RoundedLabel></TableCell>
    {/each}
</Table>
