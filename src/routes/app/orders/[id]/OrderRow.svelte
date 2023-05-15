<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$lib/components/Button.svelte";
    import Date from "$lib/components/formatters/Date.svelte";
    import Price from "$lib/components/formatters/Price.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";

    import { OrdersStateOptions, type OrdersResponse, type ProjectsResponse } from "$lib/DBTypes";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import type { OrderRowsResponseExpanded } from "../../approx/+page.server";

    let confirmDelete = false;

    export let order: OrdersResponse;
    export let orderRow: OrderRowsResponseExpanded;
    export let projects: Array<ProjectsResponse>;

    $: if(confirmDelete) { setTimeout(() => confirmDelete = false, 5000)}

</script>

<TableRow>
    <TableCell>
        {#if order.state === OrdersStateOptions.draft}
            <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                <input type="hidden" name="id" value={orderRow.id} />
                <FormInput type="select" name="project" bind:value={orderRow.project} validateOnChange={true}>
                    <option value="">—</option>
                    {#each projects as project}
                        <option value={project.id}>{project.name}</option>
                    {/each}
                </FormInput>
            </form>
        {:else}
            {projects.find(p => p.id === orderRow.project)?.name ?? "—"}
        {/if}
    </TableCell>
    <TableCell><a href="/app/articles/{orderRow.expand?.article.id}">{orderRow.expand?.article.name}</a></TableCell>
    <TableCell>{orderRow.expand?.article.reference}</TableCell>
    <TableCell>
        {#if order.state === OrdersStateOptions.draft}
            <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                <input type="hidden" name="id" value={orderRow.id} />
                <FormInput type="number" name="quantity" bind:value={orderRow.quantity} validateOnChange={true} min={orderRow.expand?.article?.order_quantity} step={orderRow.expand?.article?.order_quantity}/>
            </form>
        {:else}
            {orderRow.quantity}
        {/if}
    </TableCell>
    <TableCell>
        {#if order.state === OrdersStateOptions.draft}
            <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                <input type="hidden" name="id" value={orderRow.id} />
                <FormInput type="date" name="needed_date" value={orderRow.needed_date?.split(" ").at(0) ?? undefined} validateOnChange={true} />
            </form>
        {:else}
            <Date date={orderRow.needed_date} />
        {/if}
    </TableCell>
    {#if order.state === OrdersStateOptions.acknowledged}
        <TableCell>
            <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                <input type="hidden" name="id" value={orderRow.id} />
                <FormInput type="date" name="ack_date" value={orderRow.ack_date?.split(" ").at(0) ?? undefined} validateOnChange={true} />
            </form>
        </TableCell>
    {/if}
    <TableCell>
        {#if order.state === OrdersStateOptions.acknowledged}
            <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                <input type="hidden" name="id" value={orderRow.id} />
                <FormInput type="number" name="ack_price" label={orderRow.ack_price === 0 ? "Prix a valider" : undefined} value={orderRow.ack_price || (orderRow.expand?.article.price ?? 0)} validateOnChange={true} step={0.01} min={0} />
            </form>
        {:else}
            <Price value={orderRow.expand?.article.price ?? 0} />
        {/if}
    </TableCell>
    <TableCell><Price value={((orderRow.ack_price || (orderRow.expand?.article.price ?? 0)) * orderRow.quantity)} /></TableCell>
    {#if order.state === OrdersStateOptions.draft}
        <TableCell>
            {#if confirmDelete}
                <form action="?/deleteOrderRow" method="post" use:enhance>
                    <input type="hidden" name="id" value={orderRow.id} />
                    <Button role="danger" size="small">Confirmer</Button>
                </form>
            {:else}
                <Button role="danger" size="small" on:click={() => confirmDelete = true}>Supprimer</Button>
            {/if}
        </TableCell>
    {/if}
</TableRow>