<script lang="ts">
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import Button from "$lib/components/Button.svelte";
    import Date from "$lib/components/formatters/Date.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    $: if(form !== undefined && browser) { invalidateAll(); }

</script>
<h2>Approvisionement</h2>
<p>Articles en attente de réception.</p>

<Table>
    <svelte:fragment slot="head">
        <TableHead>Article</TableHead>
        <TableHead>Date d'arrivée</TableHead>
        <TableHead>Quantité en attente</TableHead>
        <TableHead>Quantité reçue</TableHead>
        <TableHead>Réception</TableHead>
    </svelte:fragment>
    <svelte:fragment slot="body">
        {#each data.order_rows as order_row}
            <TableRow>
                <TableCell>
                    <ArticleRow article={order_row.expand?.article} displayStock={true} />
                </TableCell>
                <TableCell><Date date={order_row.delivery_date} /></TableCell>
                <TableCell>{order_row.quantity - (order_row.quantity_received ?? 0)}</TableCell>
                <TableCell>{order_row.quantity_received}</TableCell>
                <TableCell>
                    <form action="?/receiveArticle" method="post" use:enhanceNoReset class="flex flex-row gap-4 items-end">
                        <input type="hidden" name="article" value={order_row.expand?.article?.id} />
                        <input type="hidden" name="order_row" value={order_row.id} />
                        <FormInput name="received_quantity" type="number" min={0} max={order_row.quantity - (order_row.quantity_received ?? 0)} value={0} label="Quantité recue" labelMandatory={true} backgroundColor="bg-white" />
                        <Button>Valider la réception</Button>
                    </form>
                </TableCell>
            </TableRow>
        {/each}
    </svelte:fragment>
</Table>