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
    import { _ } from "svelte-i18n";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    $: if(form !== undefined && browser) { invalidateAll(); }
</script>

<svelte:head>
    <title>mink - {$_('scm.inbound_supplies.lead')}</title>
</svelte:head>

<h1>{$_('scm.inbound_supplies.lead')}</h1>
<p>{$_('scm.inbound_supplies.description')}</p>

{#if data.orderRows.length > 0}
    <Table class="mt-6" headers={[
        { label: $_('app.generic.article') },
        { label: $_('app.generic.delivery_date') },
        { label: $_('app.generic.order') },
        { label: $_('app.generic.waited_quantity') },
        { label: $_('app.generic.received_quantity') },
        { label: $_('app.generic.handle_receive') },
    ]}>
        {#each data.orderRows as orderRow}
            <TableCell>
                <ArticleRow article={orderRow.article} displayStock={true} />
            </TableCell>
            <TableCell><Date date={orderRow.ack_date} colorDate={true} /></TableCell>
            <TableCell><a href="/app/scm/orders/{orderRow.order_id}">{orderRow.order.name}</a></TableCell>
            <TableCell>{orderRow.needed_quantity - (orderRow.received_quantity)}</TableCell>
            <TableCell>{orderRow.received_quantity}</TableCell>
            <TableCell>
                <form action="?/receiveArticle" method="post" use:enhanceNoReset class="flex flex-row gap-4 items-end">
                    <input type="hidden" name="article" value={orderRow.article_id} />
                    <input type="hidden" name="order_row" value={orderRow.id} />

                    <FormInput name="received_quantity" type="number" min={0} max={orderRow.needed_quantity - orderRow.received_quantity} value={0} step={orderRow.article.unit !== "unit" ? (orderRow.article.unit_quantity || 1) : 1} label={$_('app.generic.received_quantity')} required backgroundColor="bg-white" />
                    
                    <FormInput name="store_in" type="select" value="" required label={$_('app.generic.destination_store')}>
                        <option value=''>—</option>
                        {#each data.stores as store}
                            <option value={store.id}>{store.name} / {store.location}</option>
                        {/each}
                    </FormInput>
                    <Button>{$_('app.action.validate')}</Button>
                </form>
            </TableCell>
        {/each}
    </Table>
{:else}
    <EmptyData on:click={() => goto("/app/scm/orders")} />
{/if}

