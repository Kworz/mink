<script lang="ts">
    import ArticleRow, { articleResponseExpand } from "$lib/components/article/ArticleRow.svelte";
    import Button from "$lib/components/Button.svelte";
    import Date from "$lib/components/formatters/Date.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Table from "$lib/components/table2/Table.svelte";
    import TableCell from "$lib/components/table2/TableCell.svelte";
    import type { StoresResponse } from "$lib/DBTypes";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import type { OrderRowsResponseExpanded } from "./+page.server";

    export let orderRows: Array<OrderRowsResponseExpanded>;
    export let stores: Array<StoresResponse>;

</script>

<Table headers={[
    {label: "Article"},
    {label: "Date d'arrivée"},
    {label: "Commande"},
    {label: "Quantité en attente"},
    {label: "Quantité reçue"},
    {label: "Réception"},
]}>

    {#each orderRows as orderRow}
        <TableCell>
            <ArticleRow article={orderRow.expand?.article} displayStock={true} />
        </TableCell>
        <TableCell><Date date={orderRow.ack_date} colorDate={true} /></TableCell>
        <TableCell><a href="/app/scm/orders/{orderRow.order}">{orderRow.expand?.order?.name}</a></TableCell>
        <TableCell>{orderRow.quantity - (orderRow.quantity_received ?? 0)}</TableCell>
        <TableCell>{orderRow.quantity_received}</TableCell>
        <TableCell>
            <form action="?/receiveArticle" method="post" use:enhanceNoReset class="flex flex-row gap-4 items-end">
                <input type="hidden" name="article" value={orderRow.expand?.article?.id} />
                <input type="hidden" name="order_row" value={orderRow.id} />

                <FormInput name="received_quantity" type="number" min={0} max={orderRow.quantity - (orderRow.quantity_received ?? 0)} value={0} step={orderRow.expand?.article?.unit !== "u" ? 0.1 : 1} label="Quantité recue" labelMandatory={true} backgroundColor="bg-white" />
                
                <FormInput name="store_in" type="select" value="" labelMandatory label="Stock de destination">
                    <option value=''>—</option>
                    {#each stores as store}
                        <option value={store.id}>{store.name} / {store.location}</option>
                    {/each}
                </FormInput>
                <Button>Valider</Button>
            </form>
        </TableCell>
    {/each}
    
</Table>