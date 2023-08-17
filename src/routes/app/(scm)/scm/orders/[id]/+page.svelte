<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    import ArticleFinder from "$lib/components/article/ArticleFinder.svelte";
    import Button from "$lib/components/Button.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import Price from "$lib/components/formatters/Price.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Grid from "$lib/components/layout/grid.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Table from "$lib/components/table2/Table.svelte";
    import TableCell from "$lib/components/table2/TableCell.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { Collections, OrdersStateOptions } from "$lib/DBTypes";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { Printer, Trash } from "@steeze-ui/heroicons";
    import type { ArticleResponseExpanded } from "../../articles/+page.server";

    import { env } from "$env/dynamic/public";

    import type { ActionData, PageData } from "./$types";
    import RoundedLabel from "$lib/components/RoundedLabel.svelte";
    import Date from "$lib/components/formatters/Date.svelte";
    import { enhance } from "$app/forms";
    import { onMount } from "svelte";

    const states: Record<OrdersStateOptions, string> = {
        "draft": "Brouillon",
        "quotation": "Demande de devis",
        "placed": "Commandé",
        "acknowledged": "AR réceptionné",
        "completed": "Terminée",
        "cancelled": "Annulée"
    }

    const statesKeys = Object.keys(states) as Array<OrdersStateOptions>;

    let selectedArticle: ArticleResponseExpanded | undefined = undefined;
    let selectedArticleQuantity = 0;

    let confirmDelete = false;

    let selectedOrderRows: string[] = [];

    export let data: PageData;
    export let form: ActionData;

    $: htTotal = (data.order.expand?.["orders_rows(order)"]?.map(k => k.quantity * (k.ack_price || (k.expand?.article.price ?? 0))).reduce((p, c) => p + c, 0) ?? 0) + (data.order.delivery_fees ?? 0);
    $: tvaSubtotal = Math.floor(((htTotal * (1 + (data.order.vat ?? 20) / 100)) - htTotal) * 100) / 100;
    $: completeTotal = htTotal + tvaSubtotal;
    
    $: if(form !== null) { invalidateAll(); selectedArticle = undefined; }
    $: if(confirmDelete) { setTimeout(() => confirmDelete = false, 3500) };
    $: if(batchDeleteConfirm) { setTimeout(() => batchDeleteConfirm = false, 3500) };

    const batchEditProject = async (project: string) => {

        console.log("test");
        for(const order_row of selectedOrderRows)
        {
            await $page.data.pb.collection(Collections.OrdersRows).update(order_row, {
                project
            });
        }
        await invalidateAll();
    }

    const batchEditACKDate = async (date: string) => {
        for(const order_row of selectedOrderRows)
        {
            await $page.data.pb.collection(Collections.OrdersRows).update(order_row, {
                ack_date: date
            });
        }
        await invalidateAll();
    }

    let batchDeleteConfirm = false;
    const batchDelete = async () => {
        if(!batchDeleteConfirm)
        {
            batchDeleteConfirm = true;
            return;
        }
        for(const order_row of selectedOrderRows)
        {
            await $page.data.pb.collection(Collections.OrdersRows).delete(order_row);
        }
        await invalidateAll();
    }

    const deleteOrder = async () => {
        if(confirmDelete === false)
        {
            confirmDelete = true;
            return;
        }
        
        const orderRows = await $page.data.pb.collection(Collections.OrdersRows).getFullList({ filter: `order = "${data.order.id}"`});

        for(const or of orderRows)
        {
            await $page.data.pb.collection(Collections.OrdersRows).delete(or.id);
        }

        await $page.data.pb.collection(Collections.Orders).delete(data.order.id);

        goto("/app/scm/orders");
    }

    const addOrderRow = async () => {

        if(selectedArticle === undefined) return;

        try
        {
                await $page.data.pb.collection(Collections.OrdersRows).create({
                order: data.order.id,
                article: selectedArticle.id,
                quantity: selectedArticleQuantity,
            });

            selectedArticle = undefined;
            selectedArticleQuantity = 0;

            invalidateAll();
        }
        catch(e)
        {
            console.error(e);
        }
    }

    onMount(() => {
        const subscribefn = $page.data.pb.collection(Collections.Orders).subscribe(data.order.id, () => invalidateAll());
        return subscribefn;
    })

</script>

<svelte:head>
    <title>Commande — {data.order.name}</title>
</svelte:head>

<Wrapper>
    <PillMenu>
        <PillMenuButton icon={Printer} click={() => window.open(`/app/scm/orders/${data.order.id}/export`, '_blank')?.focus()}>Créer un PDF de la commande</PillMenuButton>
        <PillMenuButton icon={Trash} click={() => { deleteOrder(); return false; }}>Supprimer</PillMenuButton>
    </PillMenu>

    <h3>Commande <RoundedLabel>{data.order.sub_id}</RoundedLabel></h3>

    <form action="?/editOrder" method="post" use:enhanceNoReset class="flex md:flex-row flex-col gap-2 mt-4">
        <FormInput label="Description" labelMandatory name="name" value={data.order.name} validateOnChange parentClass="grow" />
        <FormInput label="Etat de la commande" type="select" name="state" value={data.order.state} validateOnChange>
            {#each statesKeys as state}
                <option value={state} class="capitalize">{states[state]}</option>
            {/each}
        </FormInput>
    </form>
</Wrapper>

<Grid cols={2} gap={8} items="start" class="mt-8">
    <Wrapper>
        <h2>{env.PUBLIC_COMPANY_NAME}</h2>
        <p class="my-2">{@html env.PUBLIC_COMPANY_ADDRESS.split(",").join(',</br>')}</p>
        <DetailLabel>{data.order.expand?.issuer.email}</DetailLabel>
    </Wrapper>

    <Wrapper>
        <p class="text-gray-500 text-sm">Fournisseur</p>
        <h3>{data.order.expand?.supplier.name}</h3>
        <p class="my-2">{@html data.order.expand?.supplier.address?.split(",").join(',</br>')}</p>
        <DetailLabel>{data.order.expand?.supplier.contact_email}</DetailLabel>
    </Wrapper>
</Grid>

{#if data.order.expand?.["orders_rows(order)"]}
    <Wrapper class="mt-8">
        <Table headers={[
            "selectAll",
            { label: "Affaire" },
            { label: "Article" },
            { label: "Référence" },
            { label: "Quantité" },
            { label: "Délai A/R" },
            { label: "Prix A/R" },
            { label: "Total" },
            (data.order.state === OrdersStateOptions.draft) ? { label: "Supprimer" } : undefined
            ]}
            selectables={data.order.expand?.["orders_rows(order)"].map(k => k.id)}
            bind:selected={selectedOrderRows}
        >
            {#if selectedOrderRows.length > 1}
                <TableCell />
                <TableCell>
                    <FormInput type="select" name="project" change={(val) => void batchEditProject(val)}>
                        <option value="">—</option>
                        {#each data.projects as project}
                            <option value={project.id}>{project.name}</option>
                        {/each}
                    </FormInput>
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>
                    {#if data.order.state === OrdersStateOptions.acknowledged}
                        <FormInput type="date" name="ack_date" change={(val) => void batchEditACKDate(val)} />

                    {/if}
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                {#if data.order.state === OrdersStateOptions.draft}
                    <TableCell>
                        <Button size="small" role="danger" on:click={batchDelete}>{batchDeleteConfirm ? "Confirmer" : "Supprimer"} ({selectedOrderRows.length})</Button>
                    </TableCell>
                {/if}
            {/if}

            {#each data.order.expand?.["orders_rows(order)"] as order_row (order_row.id)}
                <TableCell>
                    <input type="checkbox" bind:group={selectedOrderRows} value={order_row.id} />
                </TableCell>
                <TableCell>
                    {#if data.order.state === OrdersStateOptions.draft}
                        <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                            <input type="hidden" name="id" value={order_row.id} />
                            <FormInput type="select" name="project" bind:value={order_row.project} validateOnChange={true}>
                                <option value="">—</option>
                                {#each data.projects as project}
                                    <option value={project.id}>{project.name}</option>
                                {/each}
                            </FormInput>
                        </form>
                    {:else}
                        {data.projects.find(p => p.id === order_row.project)?.name ?? "—"}
                    {/if}
                </TableCell>
                <TableCell><a href="/app/scm/articles/{order_row.expand?.article.id}">{order_row.expand?.article.name}</a></TableCell>
                <TableCell>{order_row.expand?.article.reference}</TableCell>
                <TableCell>
                    {#if data.order.state === OrdersStateOptions.draft}
                        <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                            <input type="hidden" name="id" value={order_row.id} />
                            <FormInput type="number" name="quantity" bind:value={order_row.quantity} validateOnChange={true} min={order_row.expand?.article?.order_quantity} step={order_row.expand?.article?.order_quantity}/>
                        </form>
                    {:else}
                        {order_row.quantity}
                    {/if}
                </TableCell>
                <TableCell>
                    {#if data.order.state === OrdersStateOptions.acknowledged}
                        <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                            <input type="hidden" name="id" value={order_row.id} />
                            <FormInput type="date" name="ack_date" value={order_row.ack_date?.split(" ").at(0) ?? undefined} validateOnChange={true} />
                        </form>
                    {:else}
                        <Date value={order_row.ack_date} />
                    {/if}
                </TableCell>
                <TableCell>
                    {#if data.order.state === OrdersStateOptions.acknowledged}
                        <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                            <input type="hidden" name="id" value={order_row.id} />
                            <FormInput type="number" name="ack_price" label={order_row.ack_price === 0 ? "Prix a valider" : undefined} value={order_row.ack_price || (order_row.expand?.article.price ?? 0)} validateOnChange={true} step={0.00001} min={0} />
                        </form>
                    {:else}
                        <Price value={order_row.expand?.article.price ?? 0} />
                    {/if}
                </TableCell>
                <TableCell><Price value={((order_row.ack_price || (order_row.expand?.article.price ?? 0)) * order_row.quantity)} /></TableCell>
                {#if data.order.state === OrdersStateOptions.draft}
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
    </Wrapper>
{/if}

{#if data.order.state === OrdersStateOptions.draft}
    <Wrapper class="mt-6">
        <h3 class="mb-3">Ajouter un article a la commande</h3>
        <div class="flex flex-row gap-4 items-end">
            <div class="{selectedArticle !== undefined ? "w-2/3" : "w-full"}">
                <ArticleFinder bind:selectedArticle />
            </div>

            {#if selectedArticle !== undefined}
                <FormInput name="quantity" type="number" bind:value={selectedArticleQuantity} min={selectedArticle?.order_quantity} step={selectedArticle?.order_quantity} label="Quantité à commander" labelMandatory={true} />
                <Button class="ml-auto" on:click={addOrderRow}>Ajouter l'article</Button>
            {/if}
        </div>
    </Wrapper>
{/if}

<Wrapper class="w-max ml-auto mt-8">
    <Table cols={3}>
    
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
</Wrapper>
