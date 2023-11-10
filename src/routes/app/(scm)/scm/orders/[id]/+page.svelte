<script lang="ts">
    import { goto, invalidate, invalidateAll } from "$app/navigation";
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

    import { env } from "$env/dynamic/public";

    import type { ActionData, PageData } from "./$types";
    import RoundedLabel from "$lib/components/RoundedLabel.svelte";
    import Date from "$lib/components/formatters/Date.svelte";
    import { enhance } from "$app/forms";
    import type { SCMArticle } from "@prisma/client";
    import Modal from "$lib/components/modal/Modal.svelte";

    const states: Record<OrdersStateOptions, string> = {
        "draft": "Brouillon",
        "quotation": "Demande de devis",
        "placed": "Commandé",
        "acknowledged": "AR réceptionné",
        "completed": "Terminée",
        "cancelled": "Annulée"
    }

    const statesKeys = Object.keys(states) as Array<OrdersStateOptions>;

    let selectedArticle: SCMArticle | undefined = undefined;
    let selectedArticleQuantity = 0;

    let confirmDelete = false;
    let deleteOrder = false;

    let selectedOrderRows: string[] = [];

    export let data: PageData;
    export let form: ActionData;

    $: htTotal = (data.order.order_rows.map(k => k.needed_quantity * (k.ack_price ?? 0)).reduce((p, c) => p + c, 0) ?? 0) + (data.order.delivery_fees ?? 0);
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

</script>

<svelte:head>
    <title>Commande — {data.order.name}</title>
</svelte:head>

{#if deleteOrder}
    <Modal title="Confirmer" close={() => deleteOrder = false}>
        <p>Souhaitez vous supprimer la commande <strong>{data.order.name}</strong>?</p>

        <form action="?/deleteOrder" method="post" use:enhance slot="form" class="flex flex-row gap-4">
            <Button size="small" role="danger">Confirmer</Button>
            <Button size="small" role="tertiary" on:click={() => deleteOrder = false} preventSend>Annuler</Button>
        </form>
    </Modal>
{/if}

<Wrapper>
    <PillMenu>
        <PillMenuButton icon={Printer} click={() => window.open(`/app/scm/orders/${data.order.id}/export`, '_blank')?.focus()}>Créer un PDF de la commande</PillMenuButton>
        <PillMenuButton icon={Trash} click={() => deleteOrder = true }>Supprimer</PillMenuButton>
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
        <h2>{$page.data.appSettings.appCompanyName}</h2>
        <p class="my-2">{@html $page.data.appSettings.appCompanyAddress.split(",").join(',</br>')}</p>
        <DetailLabel>{data.order.issuer.email}</DetailLabel>
    </Wrapper>

    <Wrapper>
        <p class="text-gray-500 text-sm">Fournisseur</p>
        <h3>{data.order.supplier.name}</h3>
        <p class="my-2">{@html data.order.supplier?.address?.split(",").join(',</br>')}</p>
        <DetailLabel>{data.order.supplier.email || "pas d'addresse mail spécifiée"}</DetailLabel>
    </Wrapper>
</Grid>

{#if data.order.order_rows}
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
            selectables={data.order.order_rows.map(or => or.id)}
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

            {#each data.order.order_rows as order_row (order_row.id)}
                <TableCell>
                    <input type="checkbox" bind:group={selectedOrderRows} value={order_row.id} />
                </TableCell>
                <TableCell>
                    {#if data.order.state === OrdersStateOptions.draft}
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
                    {#if data.order.state === OrdersStateOptions.draft}
                        <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                            <input type="hidden" name="id" value={order_row.id} />
                            <FormInput type="number" name="needed_quantity" bind:value={order_row.needed_quantity} validateOnChange={true} min={order_row.article.order_quantity} step={order_row.article.order_quantity}/>
                        </form>
                    {:else}
                        {order_row.needed_quantity}
                    {/if}
                </TableCell>
                <TableCell>
                    {#if data.order.state === OrdersStateOptions.acknowledged}
                        <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                            <input type="hidden" name="id" value={order_row.id} />
                            <FormInput type="date" name="ack_date" value={order_row.ack_date?.toISOString().split("T").at(0) ?? undefined} validateOnChange={true} />
                        </form>
                    {:else}
                        <Date value={order_row.ack_date} />
                    {/if}
                </TableCell>
                <TableCell>
                    {#if data.order.state === OrdersStateOptions.acknowledged}
                        <form action="?/editOrderRow" method="post" use:enhanceNoReset>
                            <input type="hidden" name="id" value={order_row.id} />
                            <FormInput type="number" name="ack_price" label={order_row.ack_price === 0 ? "Prix a valider" : undefined} value={order_row.ack_price} validateOnChange={true} step={0.00001} min={0} />
                        </form>
                    {:else}
                        <Price value={order_row.ack_price} />
                    {/if}
                </TableCell>
                <TableCell><Price value={(order_row.ack_price ?? 0) * order_row.needed_quantity} /></TableCell>
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
