<script lang="ts">
    import { browser } from "$app/environment";
    import { goto, invalidateAll } from "$app/navigation";
    import EmptyData from "$lib/components/EmptyData.svelte";
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import Date from "$lib/components/generics/formatters/Date.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    $: if(form !== undefined && browser) { invalidateAll(); }
</script>

<svelte:head>
    <title>mink - Approvisionement</title>
</svelte:head>

<h1>Approvisionement</h1>
<p>Articles en attente de réception.</p>

{#if data.orderRows.length > 0}
    <Table class="mt-6" headers={[
        {label: "Article"},
        {label: "Date d'arrivée"},
        {label: "Commande"},
        {label: "Quantité en attente"},
        {label: "Quantité reçue"},
        {label: "Réception"},
    ]}>
        {#each data.orderRows as orderRow}
            <TableCell>
                <ArticleRow article={orderRow.article} displayStock={true} />
            </TableCell>
            <TableCell><Date date={orderRow.ack_date?.toISOString()} colorDate={true} /></TableCell>
            <TableCell><a href="/app/scm/orders/{orderRow.order_id}">{orderRow.order.name}</a></TableCell>
            <TableCell>{orderRow.needed_quantity - (orderRow.received_quantity)}</TableCell>
            <TableCell>{orderRow.received_quantity}</TableCell>
            <TableCell>
                <form action="?/receiveArticle" method="post" use:enhanceNoReset class="flex flex-row gap-4 items-end">
                    <input type="hidden" name="article" value={orderRow.article_id} />
                    <input type="hidden" name="order_row" value={orderRow.id} />

                    <FormInput name="received_quantity" type="number" min={0} max={orderRow.needed_quantity - orderRow.received_quantity} value={0} step={orderRow.article.unit !== "u" ? 0.1 : 1} label="Quantité recue" labelMandatory={true} backgroundColor="bg-white" />
                    
                    <FormInput name="store_in" type="select" value="" labelMandatory label="Stock de destination">
                        <option value=''>—</option>
                        {#each data.stores as store}
                            <option value={store.id}>{store.name} / {store.location}</option>
                        {/each}
                    </FormInput>
                    <Button>Valider</Button>
                </form>
            </TableCell>
        {/each}
    </Table>
{:else}
    <EmptyData on:click={() => goto("/app/scm/orders")} />
{/if}

