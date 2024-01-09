<script lang="ts">
    import { invalidateAll } from "$app/navigation";
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
    import { scm_order_state } from "@prisma/client";
    import Modal from "$lib/components/generics/modal/Modal.svelte";
    import type { scm_articleWithIncludes } from "$lib/components/derived/article/article";

    let selectedArticle: scm_articleWithIncludes| undefined = undefined;
    let selectedArticleQuantity = 0;

    let confirmDelete = false;
    let deleteOrder = false;
    let batchDeleteConfirm = false;

    let selectedOrderRows: string[] = [];

    export let data: PageData;
    export let form: ActionData;

    $: htTotal = (data.order.order_rows.map(k => k.needed_quantity * (k.ack_price ?? 0)).reduce((p, c) => p + c, 0) ?? 0) + (data.order.delivery_fees ?? 0);
    $: tvaSubtotal = Math.floor(((htTotal * (1 + (data.order.vat ?? 20) / 100)) - htTotal) * 100) / 100;
    $: completeTotal = htTotal + tvaSubtotal;
    
    $: if(form !== null) { invalidateAll(); selectedArticle = undefined; }
    $: if(confirmDelete) { setTimeout(() => confirmDelete = false, 3500) };
    $: if(batchDeleteConfirm) { setTimeout(() => batchDeleteConfirm = false, 3500) };
</script>

<svelte:head>
    <title>Commande — {data.order.name}</title>
</svelte:head>

{#if deleteOrder}
    <Modal title="Confirmer" on:close={() => deleteOrder = false}>
        <p>Souhaitez vous supprimer la commande <strong>{data.order.name}</strong>?</p>

        <form action="?/deleteOrder" method="post" use:enhance slot="form" class="flex flex-row gap-4">
            <Button size="small" role="danger">Confirmer</Button>
            <Button size="small" role="tertiary" on:click={() => deleteOrder = false} preventSend>Annuler</Button>
        </form>
    </Modal>
{/if}

<PillMenu>
    <PillMenuButton icon={Printer} click={() => window.open(`/app/scm/orders/${data.order.id}/export`, '_blank')?.focus()}>Créer un PDF de la commande</PillMenuButton>
    <PillMenuButton icon={Trash} click={() => deleteOrder = true }>Supprimer</PillMenuButton>
</PillMenu>

<h1>Commande <RoundedLabel class="-translate-y-2 ml-2">{data.order.sub_id}</RoundedLabel></h1>

<form action="?/editOrder" method="post" use:enhanceNoReset class="flex md:flex-row flex-col gap-6 mt-6">
    <FormInput label="Description" labelMandatory name="name" value={data.order.name} validateOnChange parentClass="grow" />
    <FormInput label="Etat de la commande" type="select" name="state" value={data.order.state} validateOnChange>
        {#each Object.entries(scm_order_state) as state}
            <option value={state} class="capitalize">{state}</option> <!-- TODO: i18n -->
        {/each}
    </FormInput>
</form>

<Grid cols={2} gap={6} items="start" class="mt-6">
    <Wrapper>
        <h2>{$page.data.appSettings.appCompanyName}</h2>
        <p class="my-2">{@html $page.data.appSettings.appCompanyAddress.split(",").join(',</br>')}</p>
        <DetailLabel>{data.order.issuer.email}</DetailLabel>
    </Wrapper>

    <Wrapper>
        <h2>Fournisseur</h2>
        <p class="text-sm">{data.order.supplier.name}</p>
        <p class="my-2">{@html data.order.supplier?.address?.split(",").join(',</br>')}</p>
        <DetailLabel>{data.order.supplier.email || "pas d'addresse mail spécifiée"}</DetailLabel>
    </Wrapper>
</Grid>

{#if data.order.order_rows}
    <Table headers={[
        "selectAll",
        { label: "Affaire" },
        { label: "Article" },
        { label: "Référence" },
        { label: "Quantité" },
        { label: "Délai A/R" },
        { label: "Prix A/R" },
        { label: "Total" },
        (data.order.state === scm_order_state.draft) ? { label: "Supprimer" } : undefined
        ]}
        selectables={data.order.order_rows.map(or => or.id)}
        bind:selected={selectedOrderRows}
        class="mt-6"
    >
        {#if selectedOrderRows.length > 1}
            <TableCell />
            <TableCell>
                <form action="?/batchEdit" use:enhanceNoReset method="post">
                    <input type="hidden" value={selectedOrderRows.join(",")} name="order_rows" />
                    <FormInput type="select" name="project" validateOnChange>
                        <option value="">—</option>
                        {#each data.projects as project}
                            <option value={project.id}>{project.name}</option>
                        {/each}
                    </FormInput>
                </form>
            </TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell>
                {#if data.order.state === scm_order_state.acknowledged}
                    <form action="?/batchEdit" use:enhanceNoReset method="post">
                        <input type="hidden" value={selectedOrderRows.join(",")} name="order_rows" />
                        <FormInput type="date" name="ack_date" validateOnChange />
                    </form>
                {/if}
            </TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            {#if data.order.state === scm_order_state.draft}
                <TableCell>
                    <form action="?/batchDelete" use:enhanceNoReset method="post">
                        <input type="hidden" value={selectedOrderRows.join(",")} name="order_rows" />
                        {#if batchDeleteConfirm}
                            <Button size="small" role="danger">Confirmer</Button>
                        {:else}
                            <Button size="small" role="danger" on:click={() => batchDeleteConfirm = true} preventSend>Supprimer les {selectedOrderRows.length} ligne(s)</Button>
                        {/if}
                    </form>
                </TableCell>
            {/if}
        {/if}

        {#each data.order.order_rows as order_row (order_row.id)}
            <TableCell>
                <input type="checkbox" bind:group={selectedOrderRows} value={order_row.id} />
            </TableCell>
            <TableCell>
                {#if data.order.state === scm_order_state.draft}
                    <form action="?/editOrderRow" method="post" use:enhanceNoReset>
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
            <TableCell><a href="/app/scm/articles/{order_row.article.id}">{order_row.article.name}</a></TableCell>
            <TableCell>{order_row.article.reference}</TableCell>
            <TableCell>
                {#if data.order.state === scm_order_state.draft}
                    <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                        <input type="hidden" name="id" value={order_row.id} />
                        <FormInput type="number" name="needed_quantity" bind:value={order_row.needed_quantity} validateOnChange={true} min={order_row.article.order_quantity} step={order_row.article.order_quantity}/>
                    </form>
                {:else}
                    {order_row.needed_quantity}
                {/if}
            </TableCell>
            <TableCell>
                {#if data.order.state === scm_order_state.acknowledged}
                    <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                        <input type="hidden" name="id" value={order_row.id} />
                        <FormInput type="date" name="ack_date" value={order_row.ack_date?.toISOString().split("T").at(0) ?? undefined} validateOnChange={true} />
                    </form>
                {:else}
                    <Date value={order_row.ack_date} />
                {/if}
            </TableCell>
            <TableCell>
                {#if data.order.state === scm_order_state.acknowledged}
                    <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                        <input type="hidden" name="id" value={order_row.id} />
                        <FormInput type="number" name="ack_price" label={order_row.ack_price === 0 ? "Prix a valider" : undefined} value={order_row.ack_price} validateOnChange={true} step={0.00001} min={0} />
                    </form>
                {:else}
                    <Price value={order_row.ack_price} />
                {/if}
            </TableCell>
            <TableCell><Price value={(order_row.ack_price ?? 0) * order_row.needed_quantity} /></TableCell>
            {#if data.order.state === scm_order_state.draft}
                <TableCell>
                    {#if confirmDelete}
                        <form action="?/deleteOrderRow" method="post" use:enhance>
                            <input type="hidden" name="id" value={order_row.id} />
                            <Button role="danger" size="small">Confirmer</Button>
                        </form>
                    {:else}
                        <Button role="danger" size="small" on:click={() => confirmDelete = true}>Supprimer</Button>
                    {/if}
                </TableCell>
            {/if}
        {/each}
    </Table>
{/if}

{#if data.order.state === scm_order_state.draft}
    <Wrapper class="mt-6">
        <h3 class="mb-3">Ajouter un article a la commande</h3>
        <form action="?/createOrderRow" method="post" use:enhanceNoReset class="flex flex-row gap-4 items-end">
            <div class="{selectedArticle !== undefined ? "w-2/3" : "w-full"}">
                <ArticleFinder articles={data.articles} bind:selectedArticle on:refreshArticles={() => invalidateAll()} />
            </div>
                
            {#if selectedArticle !== undefined}
                <input type="hidden" name="article_id" value={selectedArticle?.id} />
                <FormInput name="needed_quantity" type="number" bind:value={selectedArticleQuantity} min={selectedArticle?.order_quantity} step={selectedArticle?.order_quantity} label="Quantité à commander" labelMandatory={true} />
                <Button class="ml-auto">Ajouter l'article</Button>
            {/if}
        </form>
    </Wrapper>
{/if}

<Table cols={3} class="w-max ml-auto mt-6">
    
    <TableCell>Frais de livraison</TableCell>
    <TableCell>
        <form action="?/editOrder" method="post" use:enhanceNoReset>
            <FormInput label="Frais de livraison" name="delivery_fees" type="number" bind:value={data.order.delivery_fees} min={0} step={0.01} validateOnChange />
        </form>
    </TableCell>
    <TableCell><Price value={data.order.delivery_fees} /></TableCell>

    <TableCell>Total (HT)</TableCell>
    <TableCell colspan={2}><Price value={htTotal} /></TableCell>

    <TableCell>TVA</TableCell>
    <TableCell>
        <form action="?/editOrder" method="post" use:enhanceNoReset>
            <FormInput label="Taux de TVA" name="vat" type="number" bind:value={data.order.vat} min={0} max={100} step={0.1} validateOnChange />
        </form>
    </TableCell>
    <TableCell><Price value={tvaSubtotal} /></TableCell>

    <TableCell>Total (TTC)</TableCell>
    <TableCell colspan={2}><Price value={completeTotal} /></TableCell>

</Table>
