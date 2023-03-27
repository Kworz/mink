<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import MenuSide from "$lib/components/appLayout/MenuSide.svelte";
    import ArticleFinder from "$lib/components/article/ArticleFinder.svelte";
    import Button from "$lib/components/Button.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import Price from "$lib/components/formatters/Price.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Grid from "$lib/components/layout/grid.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import Wrapper2 from "$lib/components/Wrapper2.svelte";
    import { OrdersStateOptions } from "$lib/DBTypes";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
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

    export let data: PageData;
    export let form: ActionData;

    $: htTotal = (data.order.expand?.["orders_rows(order)"]?.map(k => k.quantity * (k.expand?.article.price ?? 0)).reduce((p, c) => p + c, 0) ?? 0);
    $: tvaSubtotal = Math.floor(((htTotal * 1.20) - htTotal) * 100) / 100;
    $: completeTotal = htTotal + tvaSubtotal;
    
    $: if(form !== null) { invalidateAll(); selectedArticle = undefined; }

</script>

<MenuSide>
    <h2>Commande</h2>
    <p>Réglages de la commande</p>

    <form action="?/editOrder" method="post" use:enhanceNoReset class="flex flex-col gap-4 mt-6">
        <FormInput bind:value={data.order.name} name="name" label="Nom de la commande" labelMandatory={true} backgroundColor="bg-white" validateOnChange={true}/>
        <FormInput type="select" bind:value={data.order.state} name="state" label="État de la commande" labelMandatory={true} backgroundColor="bg-white" validateOnChange={true}>
            {#each statesKeys as state}
                <option value={state} class="capitalize">{states[state]}</option>
            {/each}
        </FormInput>
    </form>
</MenuSide>

<Wrapper class="w-4/5 mx-auto aspect-A4 p-8">
    <h2>Commande <span class="px-3 py-1 rounded-full bg-violet-500 text-white font-medium">{data.order.name}</span></h2>

    <Grid cols={2} gap={24} items="start" class="mt-6">
        <Wrapper2>
            <Table embeded={true} backgroundColor="bg-transparent" marginTop="">
                <svelte:fragment slot="body">
                    <TableRow>
                        <TableCell><h3>Metalizz</h3></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <p>
                                840 Chemin de chabanne,
                                26270 Loriol sur drome
                            </p>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <DetailLabel>{data.order.expand?.issuer.email}</DetailLabel>
                        </TableCell>
                    </TableRow>
                </svelte:fragment>
            </Table>
        </Wrapper2>

        <Wrapper2>
            <Table embeded={true} backgroundColor="bg-transparent" marginTop="">
                <svelte:fragment slot="body">
                    <TableRow>
                        <TableCell><h3>{data.order.expand?.supplier.name}</h3></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><p>{data.order.expand?.supplier.address}</p></TableCell>
                    </TableRow>
                </svelte:fragment>
            </Table>
        </Wrapper2>
    </Grid>

    <Table backgroundColor="dark:bg-zinc-700">
        <svelte:fragment slot="head">
            <TableHead>Projet</TableHead>
            <TableHead>Désignation</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Délai Souhaité</TableHead>
            {#if data.order.state === OrdersStateOptions.acknowledged}
                <TableHead>Délai A/R</TableHead>
            {/if}
            <TableHead>Prix </TableHead>
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
        <Wrapper2 class="mt-6">
            <h3 class="mb-3">Ajouter un article a la commande</h3>
            <form action="?/createOrderRow" method="post" use:enhance class="flex flex-row gap-4 items-end">
                <div class="{selectedArticle !== undefined ? "w-2/3" : "w-full"}">
                    <ArticleFinder bind:selectedArticle filters={[{ field: "supplier", operator: "~", value: data.order.supplier, hidden: true }]} />
                </div>
                {#if selectedArticle !== undefined}
                    <input type="hidden" name="order" value={data.order.id} />
                    <input type="hidden" name="article" value={selectedArticle?.id} />
                    <FormInput name="quantity" type="number" min={selectedArticle?.order_quantity} step={selectedArticle?.order_quantity} label="Quantité à commander" labelMandatory={true} />
                    <Button class="ml-auto">Ajouter l'article</Button>
                {/if}
            </form>
        </Wrapper2>
    {/if}

    <Table class="w-auto ml-auto"  backgroundColor="dark:bg-zinc-700">
        <svelte:fragment slot="body">
            <TableRow>
                <TableCell>Total (HT)</TableCell>
                <TableCell><Price value={htTotal} /></TableCell>
            </TableRow>
            <TableRow>
                <TableCell>TVA (20%)</TableCell>
                <TableCell><Price value={tvaSubtotal} /></TableCell>
            </TableRow>
        </svelte:fragment>
        <svelte:fragment slot="foot">
            <TableRow>
                <TableCell>Total (TTC)</TableCell>
                <TableCell><Price value={completeTotal} /></TableCell>
            </TableRow>
        </svelte:fragment>
    </Table>
</Wrapper>