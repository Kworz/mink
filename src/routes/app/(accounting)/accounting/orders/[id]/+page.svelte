<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    import ArticleFinder from "$lib/components/derived/article/ArticleFinder.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import DetailLabel from "$lib/components/generics/DetailLabel.svelte";
    import Price from "$lib/components/generics/formatters/Price.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Grid from "$lib/components/generics/layout/grid.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import Wrapper from "$lib/components/generics/containers/Wrapper.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { Printer, Trash } from "@steeze-ui/heroicons";
    import type { ActionData, PageData } from "./$types";
    import RoundedLabel from "$lib/components/generics/RoundedLabel.svelte";
    import Date from "$lib/components/generics/formatters/Date.svelte";
    import { enhance } from "$app/forms";
    import Modal from "$lib/components/generics/modal/Modal.svelte";
    import type { scm_articleWithIncludes } from "$lib/components/derived/article/article";
    import { _ } from "svelte-i18n";
    import { browser } from "$app/environment";
    import { scm_order_state } from "$lib/prisma-enums";
    import { LCMArray } from "$lib/LCM";

    let orderRowMode: "article" | "text" = "article";

    let selectedArticle: scm_articleWithIncludes | undefined = undefined;
    let selectedArticleQuantity = 0;

    let deleteOrderRow: (typeof order_rows)[number][] | undefined = undefined;
    let deleteOrder = false;

    let selectedOrderRows: string[] = [];

    let articleFilter = $page.url.searchParams.has("articleFilter") ? JSON.parse(decodeURIComponent($page.url.searchParams.get("articleFilter") as string)) : {};

    const refresh = () => { if(!browser) return; goto(`?articleFilter=${encodeURIComponent(JSON.stringify(articleFilter))}`); }

    export let data: PageData;
    export let form: ActionData;

    $: order_rows = [...data.order.order_rows, ...data.order.text_rows].sort((a, b) => a.created.getTime() - b.created.getTime());

    $: htTotal = (order_rows.map(k => k.needed_quantity * (k.ack_price ?? 0)).reduce((p, c) => p + c, 0) ?? 0) + (data.order.delivery_fees ?? 0);
    $: tvaSubtotal = Math.floor(((htTotal * (1 + (data.order.vat ?? 20) / 100)) - htTotal) * 100) / 100;
    $: completeTotal = htTotal + tvaSubtotal;

    $: if(form?.deleteOrderRows !== undefined && "success" in form.deleteOrderRows) { deleteOrderRow = undefined; selectedOrderRows = []; }
    $: if(form !== null) { invalidateAll(); selectedArticle = undefined; }

    $: articleFilter, refresh();

</script>

<svelte:head>
    <title>{$_('app.generic.order')} {data.order.sub_id} - mink</title>
</svelte:head>

{#if form?.createArticleOrderRow?.error || form?.createTextOrderRow?.error}
    <Modal title={$_('app.generic.error')} on:close={() => form = null}>
        <p class="my-2">{$_(form?.createArticleOrderRow?.error || form?.createTextOrderRow?.error || "errors.generic")}</p>
    </Modal>
{/if}

{#if deleteOrder}
    <Modal on:close={() => deleteOrder = false} title={$_('scm.orders.action.delete.title')}>
        <p>{$_('scm.order.action.delete.body', { values: { name: data.order.name }})}</p>

        <form action="?/deleteOrder" method="post" use:enhance slot="form" class="flex flex-row gap-4">
            <Button size="small" role="danger">{$_('app.generic.yes')}</Button>
            <Button size="small" role="tertiary" on:click={() => deleteOrder = false} preventSend>{$_('app.generic.cancel')}</Button>
        </form>
    </Modal>
{/if}

{#if deleteOrderRow}
    <Modal on:close={() => { deleteOrderRow = undefined; selectedOrderRows = []; }} title={$_('scm.order.action.delete_order_row.title', { values: { n: deleteOrderRow.length }})}>

        {#if form?.deleteOrderRows && "error" in form.deleteOrderRows}
            <p class="text-red-500 font-semibold">{$_(form.deleteOrderRows.error)}</p>
        {/if}

        <p>{$_('scm.order.action.delete_order_row.body', { values: { n: deleteOrderRow.length }})}</p>
        
        <ul>
            {#each deleteOrderRow as order_row}
                <li>{order_row.needed_quantity} x {order_row.text !== undefined ? order_row.text : order_row.article.name}</li>
            {/each}
        </ul>

        <form action="?/deleteOrderRows" method="post" use:enhance slot="form" class="flex flex-row gap-4">
            <input type="hidden" name="id" value={deleteOrderRow.map(or => or.id).join(',')} />
            <Button size="small" role="danger">{$_('app.generic.yes')}</Button>
        </form>
    </Modal>
{/if}

<PillMenu>
    <PillMenuButton icon={Printer} click={() => window.open(`/app/scm/orders/${data.order.id}/export`, '_blank')?.focus()}>{$_('scm.orders.action.export.title')}</PillMenuButton>
    <PillMenuButton icon={Trash} click={() => deleteOrder = true }>{$_('scm.orders.action.delete.title')}</PillMenuButton>
</PillMenu>

<h1>{$_('app.generic.order')} <RoundedLabel class="-translate-y-2 ml-2">{data.order.sub_id}</RoundedLabel></h1>

<form action="?/editOrder" method="post" use:enhanceNoReset class="flex md:flex-row flex-col gap-6 mt-6">
    <FormInput label={$_('app.generic.description')} required name="name" value={data.order.name} validateOnChange parentClass="grow" />
    <FormInput label={$_('app.generic.state')} type="select" name="state" value={data.order.state} validateOnChange>
        {#each Object.keys(scm_order_state) as state}
            <option value={state} class="capitalize">{$_(`scm.orders.state.${state}`)}</option>
        {/each}
    </FormInput>
</form>

<Grid cols={2} gap={6} items="start" class="mt-6">
    <Wrapper>
        <h2>{$page.data.appSettings.company_name}</h2>

        <p class="my-2">{$page.data.appSettings.company_address_road}</p>
        <p class="my-2">{$page.data.appSettings.company_address_postal_code} / {$page.data.appSettings.company_address_city}</p>
        <p class="my-2">{$page.data.appSettings.company_address_country}</p>

        <DetailLabel>{data.order.issuer.email}</DetailLabel>
    </Wrapper>

    <Wrapper>
        <h2>{$_('app.generic.supplier')}</h2>
        <p class="text-sm">{data.order.supplier.name}</p>

        <p class="my-2">{data.order.supplier.address_road}</p>
        <p class="my-2">{data.order.supplier.address_postal_code} / {data.order.supplier.address_city}</p>
        <p class="my-2">{data.order.supplier.address_country}</p>

        <DetailLabel>{data.order.supplier.email || $_('app.generic.email_null')}</DetailLabel>
    </Wrapper>
</Grid>

{#if order_rows}
    <Table headers={[
            "selectAll",
            { label: $_('app.generic.project') },
            { label: $_('app.generic.designation') },
            { label: $_('app.generic.sku') },
            { label: $_('app.generic.quantity') },
            { label: $_('app.generic.acknowledged_delay') },
            { label: $_('app.generic.acknowledged_price') },
            { label: $_('app.generic.total') },
            (data.order.state === scm_order_state.draft) ? { label: $_('app.action.delete') } : undefined
        ]}
        selectables={order_rows.map(or => or.id)}
        bind:selected={selectedOrderRows}
        class="mt-6"
    >
        {#if selectedOrderRows.length > 1}
            <TableCell />
            <TableCell>
                <form action="?/editOrderRows" use:enhanceNoReset method="post">
                    <input type="hidden" value={selectedOrderRows.join(",")} name="order_rows" />
                    <FormInput type="select" name="project" validateOnChange>
                        <option value="">—</option>
                        {#each data.projects as project}
                            <option value={project.id}>{project.name}</option>
                        {/each}
                    </FormInput>
                </form>
            </TableCell>
            <TableCell colspan={2} />
            <TableCell>
                {#if data.order.state === scm_order_state.draft}
                    {@const lcm = LCMArray(order_rows.reduce((p, c) => [...p, c.text !== undefined ? (c.needed_quantity || 1) : c.article.order_quantity], new Array()))}
                    <form action="?/editOrderRows" method="post" use:enhanceNoReset>
                        <input type="hidden" name="id" value={selectedOrderRows.join(",")} />
                        <FormInput type="number" name="needed_quantity" value={0} validateOnChange min={0} step={lcm} />
                    </form>
                {/if}
            </TableCell>
            <TableCell>
                {#if data.order.state === scm_order_state.acknowledged}
                    <form action="?/editOrderRows" use:enhanceNoReset method="post">
                        <input type="hidden" value={selectedOrderRows.join(",")} name="order_rows" />
                        <FormInput type="date" name="ack_date" validateOnChange />
                    </form>
                {/if}
            </TableCell>
            <TableCell colspan={2} />
            {#if data.order.state === scm_order_state.draft}
                <TableCell>
                    <Button size="small" role="danger" on:click={() => deleteOrderRow = order_rows.filter(or => selectedOrderRows.includes(or.id))} preventSend>{$_('scm.order.action.delete_order_row.title', { values: { n: selectedOrderRows.length }})}</Button>
                </TableCell>
            {/if}
        {/if}

        {#each order_rows as order_row (order_row.id)}

            {@const isTextRow = order_row.text !== undefined}

            <TableCell position="center">
                <input type="checkbox" bind:group={selectedOrderRows} value={order_row.id} />
            </TableCell>
            <TableCell>
                {#if data.order.state === scm_order_state.draft}
                    <form action="?/editOrderRows" method="post" use:enhanceNoReset>
                        <input type="hidden" name="id" value={order_row.id} />
                        <FormInput type="select" name="project" bind:value={order_row.project_id} validateOnChange={true}>
                            <option value="">—</option>
                            {#each data.projects as project}
                                <option value={project.id}>{project.name}</option>
                            {/each}
                        </FormInput>
                    </form>
                {:else}
                    {order_row.project?.name ?? "—"}
                {/if}
            </TableCell>
            {#if !isTextRow}
                <TableCell><a href="/app/scm/articles/{order_row.article.id}">{order_row.article.name}</a></TableCell>
                <TableCell>{order_row.article.reference}</TableCell>
            {:else}
                <TableCell>
                    {#if data.order.state === scm_order_state.draft}
                        <form action="?/editTextOrderRow" method="post" use:enhanceNoReset>
                            <input type="hidden" name="id" value={order_row.id} />
                            <FormInput type="text" required name="text" bind:value={order_row.text} validateOnChange />
                        </form>
                    {:else}
                        {order_row.text}
                    {/if}
                </TableCell>
                <TableCell>
                    {#if data.order.state === scm_order_state.draft}
                        <form action="?/editTextOrderRow" method="post" use:enhanceNoReset>
                            <input type="hidden" name="id" value={order_row.id} />
                            <FormInput type="text" name="reference" bind:value={order_row.reference} validateOnChange />
                        </form>
                    {:else}
                        {order_row.reference}
                    {/if}
                </TableCell>
            {/if}
            
            <TableCell>
                {#if data.order.state === scm_order_state.draft}
                    <form action="?/editOrderRows" method="post" use:enhanceNoReset>
                        <input type="hidden" name="id" value={order_row.id} />
                        {#if isTextRow}
                            <FormInput type="number" name="needed_quantity" bind:value={order_row.needed_quantity} validateOnChange={true} min={0} step={1}/>
                        {:else}
                            <FormInput type="number" name="needed_quantity" bind:value={order_row.needed_quantity} validateOnChange={true} min={order_row.article.order_quantity} step={order_row.article.order_quantity}/>
                        {/if}
                    </form>
                {:else}
                    {order_row.needed_quantity}
                {/if}
            </TableCell>
            <TableCell>
                {#if data.order.state === scm_order_state.acknowledged}
                    <form action="?/editOrderRows" method="post" use:enhanceNoReset>
                        <input type="hidden" name="id" value={order_row.id} />
                        <FormInput type="date" name="ack_date" value={order_row.ack_date?.toISOString().split("T").at(0) ?? undefined} validateOnChange={true} />
                    </form>
                {:else}
                    <Date date={order_row.ack_date} />
                {/if}
            </TableCell>
            <TableCell>
                {#if data.order.state === scm_order_state.acknowledged}
                    <form action="?/editOrderRows" method="post" use:enhanceNoReset>
                        <input type="hidden" name="id" value={order_row.id} />
                        <FormInput type="number" name="ack_price" label={order_row.ack_price === 0 ? $_('app.generic.price_to_validate') : undefined} value={order_row.ack_price} validateOnChange={true} step={0.00001} min={0} />
                    </form>
                {:else}
                    <Price value={order_row.ack_price} />
                {/if}
            </TableCell>
            <TableCell><Price value={(order_row.ack_price ?? 0) * order_row.needed_quantity} /></TableCell>
            {#if data.order.state === scm_order_state.draft}
                <TableCell>
                    <Button role="danger" size="small" on:click={() => deleteOrderRow = [order_row]}>{$_('app.action.delete')}</Button>
                </TableCell>
            {/if}
        {/each}
    </Table>
{/if}

{#if data.order.state === scm_order_state.draft}
    <Wrapper class="mt-6">
        <h3 class="mb-3">{$_('app.action.add_row_to_order')}</h3>

        <FormInput type="select" label={$_('app.order.mode')} name="new_order_row_mode" bind:value={orderRowMode} required class="mb-4 w-fit">
            <option value="article">{$_('app.generic.article')}</option>
            <option value="text">{$_('app.generic.text')}</option>
        </FormInput>

        {#if orderRowMode === "text"}
            <form action="?/createTextOrderRow" method="post" use:enhanceNoReset class="flex flex-row gap-4 items-end">
                <FormInput type="text" name="text" label={$_('app.generic.designation')} required />
                <FormInput type="text" name="reference" label={$_('app.generic.sku')} />
                <FormInput type="number" name="needed_quantity" label={$_('app.generic.quantity')} required min={0} step={0} />
                <Button>{$_('app.action.add')}</Button>
            </form>
        {:else}
            <form action="?/createArticleOrderRow" method="post" use:enhanceNoReset class="flex flex-row gap-4 items-end">
                <div class="{selectedArticle !== undefined ? "w-2/3" : "w-full"}">
                    <ArticleFinder articles={data.articles} bind:selectedArticle bind:filter={articleFilter} on:filter={() => invalidateAll()} />
                </div>     
                
                {#if selectedArticle !== undefined}
                    <input type="hidden" name="article_id" value={selectedArticle?.id} />
                    <FormInput name="needed_quantity" type="number" bind:value={selectedArticleQuantity} min={selectedArticle?.order_quantity} step={selectedArticle?.order_quantity} label="Quantité à commander" required />
                    <Button class="ml-auto">{$_('app.action.add')}</Button>
                {/if}
            </form>
        {/if}
    </Wrapper>
{/if}

<Table cols={3} class="w-max ml-auto mt-6">
    
    <TableCell>{$_('app.generic.delivery_fees')}</TableCell>
    <TableCell>
        <form action="?/editOrder" method="post" use:enhanceNoReset>
            <FormInput label={$_('app.generic.delivery_fees')} name="delivery_fees" type="number" bind:value={data.order.delivery_fees} min={0} step={0.01} validateOnChange />
        </form>
    </TableCell>
    <TableCell><Price value={data.order.delivery_fees} /></TableCell>

    <TableCell>{$_('app.generic.total_untaxed')}</TableCell>
    <TableCell colspan={2}><Price value={htTotal} /></TableCell>

    <TableCell>{$_('app.generic.vat')}</TableCell>
    <TableCell>
        <form action="?/editOrder" method="post" use:enhanceNoReset>
            <FormInput label={$_('app.generic.vat_rate')} name="vat" type="number" bind:value={data.order.vat} min={0} max={100} step={0.1} validateOnChange />
        </form>
    </TableCell>
    <TableCell><Price value={tvaSubtotal} /></TableCell>

    <TableCell>Total (TTC)</TableCell>
    <TableCell colspan={2}><Price value={completeTotal} /></TableCell>

</Table>
