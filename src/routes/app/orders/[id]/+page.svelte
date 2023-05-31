<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    import ArticleFinder from "$lib/components/article/ArticleFinder.svelte";
    import Button from "$lib/components/Button.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import Price from "$lib/components/formatters/Price.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Grid from "$lib/components/layout/grid.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { Collections, OrdersStateOptions } from "$lib/DBTypes";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { Printer, Trash } from "@steeze-ui/heroicons";
    import type { ArticleResponseExpanded } from "../../articles/+page.server";

    import type { ActionData, PageData } from "./$types";
    import OrderRow from "./OrderRow.svelte";

    const states: Record<OrdersStateOptions, string> = {
        "draft": "Brouillon",
        "placed": "Commandé",
        "acknowledged": "AR réceptionné",
        "completed": "Terminée",
        "cancelled": "Annulée"
    }

    const statesKeys = Object.keys(states) as Array<OrdersStateOptions>;

    let selectedArticle: ArticleResponseExpanded | undefined = undefined;
    let selectedArticleQuantity = 0;

    let confirmDelete = false;

    export let data: PageData;
    export let form: ActionData;

    $: htTotal = (data.order.expand?.["orders_rows(order)"]?.map(k => k.quantity * (k.ack_price || (k.expand?.article.price ?? 0))).reduce((p, c) => p + c, 0) ?? 0) + (data.order.delivery_fees ?? 0);
    $: tvaSubtotal = Math.floor(((htTotal * (1 + (data.order.vat ?? 20) / 100)) - htTotal) * 100) / 100;
    $: completeTotal = htTotal + tvaSubtotal;
    
    $: if(form !== null) { invalidateAll(); selectedArticle = undefined; }
    $: if(confirmDelete) { setTimeout(() => confirmDelete = false, 3500) };

    const deleteOrder = async () => {
        if(confirmDelete === false)
        {
            confirmDelete = true;
            return;
        }
        
        await $page.data.pb.collection(Collections.Orders).delete(data.order.id);
        const orderRows = await $page.data.pb.collection(Collections.OrdersRows).getFullList({ filter: `order = "${data.order.id}"`});

        for(const or of orderRows)
        {
            await $page.data.pb.collection(Collections.OrdersRows).delete(or.id);
        }
        goto("/app/orders");
    }

    const addOrderRow = async () => {

        if(selectedArticle === undefined) return;

        try
        {
                await $page.data.pb.collection(Collections.OrdersRows).create({
                order: data.order.id,
                article: selectedArticle.id,
                quantity: selectedArticleQuantity,
            });

            selectedArticle = undefined;
            selectedArticleQuantity = 0;

            invalidateAll();
        }
        catch(e)
        {
            console.error(e);
        }
    }

</script>

<svelte:head>
    <title>Commande — {data.order.name}</title>
</svelte:head>

<Wrapper>
    <PillMenu>
        <PillMenuButton icon={Printer} click={() => window.open(`/app/orders/${data.order.id}/export`, '_blank')?.focus()}>Créer un PDF de la commande</PillMenuButton>
        <PillMenuButton icon={Trash} click={() => { deleteOrder(); return false; }}>Supprimer</PillMenuButton>
    </PillMenu>

    <form action="?/editOrder" method="post" use:enhanceNoReset class="flex flex-col gap-4">
        <Flex items="center">
            <h2>Commande N°</h2>
            <FormInput name="name" value={data.order.name} validateOnChange />
        </Flex>
        <Flex items="center">
            <h4>État de la commande:</h4>        
            <FormInput type="select" name="state" value={data.order.state} validateOnChange>
                {#each statesKeys as state}
                    <option value={state} class="capitalize">{states[state]}</option>
                {/each}
            </FormInput>
        </Flex>
    </form>
</Wrapper>

<Grid cols={2} gap={8} items="start" class="mt-8">
    <Wrapper>
        <Table embeded={true} backgroundColor="bg-transparent" marginTop="">
            <svelte:fragment slot="body">
                <TableRow>
                    <TableCell><h3>{import.meta.env.VITE_COMPANY_NAME}</h3></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell><p>{@html import.meta.env.VITE_COMPANY_ADDRESS.split(",").join(',</br>')}</p></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <DetailLabel>{data.order.expand?.issuer.email}</DetailLabel>
                    </TableCell>
                </TableRow>
            </svelte:fragment>
        </Table>
    </Wrapper>

    <Wrapper>
        <h4>Fournisseur</h4>
        <Table embeded={true} backgroundColor="bg-transparent" marginTop="">
            <svelte:fragment slot="body">
                <TableRow>
                    <TableCell><h3>{data.order.expand?.supplier.name}</h3></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell><p>{@html data.order.expand?.supplier.address?.split(",").join(',</br>')}</p></TableCell>
                </TableRow>
            </svelte:fragment>
        </Table>
    </Wrapper>
</Grid>

<Table marginTop="mt-8">
    <svelte:fragment slot="head">
        <TableHead>Projet</TableHead>
        <TableHead>Désignation</TableHead>
        <TableHead>Référence</TableHead>
        <TableHead>Quantité</TableHead>
        <TableHead>Délai Souhaité</TableHead>
        {#if data.order.state === OrdersStateOptions.acknowledged}
            <TableHead>Délai A/R</TableHead>
        {/if}
        <TableHead>Prix A/R</TableHead>
        <TableHead>Total</TableHead>
        {#if data.order.state == OrdersStateOptions.draft}
            <TableHead>Supprimer</TableHead>
        {/if}
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#if data.order.expand?.["orders_rows(order)"]}
            {#each data.order.expand?.["orders_rows(order)"] as order_row (order_row.id)}
                <OrderRow bind:order={data.order} bind:orderRow={order_row} projects={data.projects} />
            {/each}
        {/if}
    </svelte:fragment>
</Table>

{#if data.order.state === OrdersStateOptions.draft}
    <Wrapper class="mt-6">
        <h3 class="mb-3">Ajouter un article a la commande</h3>
        <div class="flex flex-row gap-4 items-end">
            <div class="{selectedArticle !== undefined ? "w-2/3" : "w-full"}">
                <ArticleFinder bind:selectedArticle filters={[{ field: "supplier", operator: "~", value: data.order.supplier, hidden: true }]} />
            </div>

            {#if selectedArticle !== undefined}
                <FormInput name="quantity" type="number" bind:value={selectedArticleQuantity} min={selectedArticle?.order_quantity} step={selectedArticle?.order_quantity} label="Quantité à commander" labelMandatory={true} />
                <Button class="ml-auto" on:click={addOrderRow}>Ajouter l'article</Button>
            {/if}
        </div>
    </Wrapper>
{/if}

<Table class="w-max ml-auto">
    <svelte:fragment slot="body">
        <TableRow>
            <TableCell>Total (HT)</TableCell>
            <TableCell colspan={2}><Price value={htTotal} /></TableCell>
        </TableRow>
        <TableRow>
            <TableCell>Frais de livraison</TableCell>
            <TableCell colspan={2}>
                <form action="?/editOrder" method="post" use:enhanceNoReset>
                    <FormInput label="Frais de livraison" name="delivery_fees" type="number" bind:value={data.order.delivery_fees} min={0} step={0.01} validateOnChange />
                </form>
            </TableCell>
            <TableCell><Price value={data.order.delivery_fees} /></TableCell>
        </TableRow>
        <TableRow>
            <TableCell>TVA</TableCell>
            <TableCell>
                <form action="?/editOrder" method="post" use:enhanceNoReset>
                    <FormInput label="Taux de TVA" name="vat" type="number" bind:value={data.order.vat} min={0} max={100} step={0.1} validateOnChange />
                </form>
            </TableCell>
            <TableCell><Price value={tvaSubtotal} /></TableCell>
        </TableRow>
    </svelte:fragment>
    <svelte:fragment slot="foot">
        <TableRow>
            <TableCell>Total (TTC)</TableCell>
            <TableCell colspan={2}><Price value={completeTotal} /></TableCell>
        </TableRow>
    </svelte:fragment>
</Table>