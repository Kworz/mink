<script lang="ts">
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import User from "$lib/components/derived/user/User.svelte";
    import { Eye, EyeSlash, PlusCircle } from "@steeze-ui/heroicons";
    
    import type { PageData } from "./$types";
    import EmptyData from "$lib/components/EmptyData.svelte";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { _ } from "svelte-i18n";

    export let data: PageData;

    let displayCompleted = false;
    let displayCancelled = false;

    $: displayCancelled, displayCompleted, refresh();

    const refresh = () => {
        if(!browser) return;
        goto(`?show_completed=${displayCompleted}&show_cancelled=${displayCancelled}`);
    }

</script>

<svelte:head>
    <title>{$_('app.generic.manufacturing_orders')} - mink</title>
</svelte:head>

<PillMenu>
    <PillMenuButton icon={PlusCircle} href="/app/scm/manufacturing_orders/new">{$_('scm.manufacturing_orders.actions.create')}</PillMenuButton>
    <PillMenuButton icon={displayCancelled ? Eye : EyeSlash} click={() => displayCancelled = !displayCancelled}>{$_(`scm.manufacturing_orders.filter.${displayCancelled ? "hide" : "show"}_cancelled`)}</PillMenuButton>
    <PillMenuButton icon={displayCompleted ? Eye : EyeSlash} click={() => displayCompleted = !displayCompleted}>{$_(`scm.manufacturing_orders.filter.${displayCompleted ? "hide" : "show"}_completed`)}</PillMenuButton>
</PillMenu>

<h1>{$_('app.generic.manufacturing_orders')}</h1>
<p>{$_('scm.manufacturing_orders.description')}</p>

{#if data.manufacturingOrders.length > 0}
    <Table embeded={true} headers={[{ label: $_('app.generic.article') }, { label: $_('app.generic.state') }, { label: $_('app.generic.quantity') }, { label: $_('app.generic.project') }, { label: $_('app.generic.user_requesting') }, { label: $_('app.generic.user_receiving') }, { label: $_('app.generic.limit_date') }]}> 

        {#each data.manufacturingOrders as manufacturingOrder}
            <TableCell>
                <a href="/app/scm/manufacturing_orders/{manufacturingOrder.id}">
                    <ArticleRow article={manufacturingOrder.article} displayStock={false} />
                </a>
            </TableCell>
            <TableCell>{manufacturingOrder.state}</TableCell>
            <TableCell>{manufacturingOrder.quantity}</TableCell>
            <TableCell>
                {#if manufacturingOrder.project !== null}
                    <a href="/app/scm/projects/{manufacturingOrder.project.id}">{manufacturingOrder.project.name}</a>
                {/if}
            </TableCell>
            <TableCell>
                {#if manufacturingOrder.askedBy !== undefined}
                    <User user={manufacturingOrder.askedBy} />
                {/if}
            </TableCell>
            <TableCell>
                {#if manufacturingOrder.receiver !== undefined}
                    <User user={manufacturingOrder.receiver} />
                {/if}
            </TableCell>
            <TableCell>{manufacturingOrder.end_date}</TableCell>
        {/each}
    </Table>
{:else}
    <EmptyData on:click={() => goto("/app/scm/manufacturing_orders/new")} />
{/if}

