<script lang="ts">
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";
    import Date from "$lib/components/formatters/Date.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import type { ActionData, PageData } from "./$types";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import Button from "$lib/components/Button.svelte";

    export let data: PageData;
    export let form: ActionData;

    $: if(form !== undefined && browser) { invalidateAll(); }

</script>

<svelte:head>
    <title>mink - Approvisionement</title>
</svelte:head>

<h1>Approvisionement</h1>
<p>Articles en attente de réception.</p>

<Table class="mt-6" headers={[
    {label: "Article"},
    {label: "Date d'arrivée"},
    {label: "Commande"},
    {label: "Quantité en attente"},
    {label: "Quantité reçue"},
    {label: "Réception"},
]}>

    {#each data.order_rows as orderRow}
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

                <FormInput name="received_quantity" type="number" min={0} max={orderRow.needed_quantity - orderRow.received_quantity} value={0} step={orderRow.expand?.article?.unit !== "u" ? 0.1 : 1} label="Quantité recue" labelMandatory={true} backgroundColor="bg-white" />
                
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