<script lang="ts">
    import { browser } from "$app/environment";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { env } from "$env/dynamic/public";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import type { ActionData, PageData } from "./$types";

    import { ArrowRight, DocumentDuplicate, PlusCircle, QrCode, Trash, WrenchScrewdriver } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";

    import ArticleForm from "$lib/components/derived/article/ArticleForm.svelte";
    import Store from "$lib/components/derived/store/Store.svelte";
    import Supplier from "$lib/components/derived/supplier/Supplier.svelte";
    import User from "$lib/components/derived/user/User.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import DetailLabel from "$lib/components/generics/DetailLabel.svelte";
    import RoundButton from "$lib/components/generics/RoundButton.svelte";
    import Wrapper from "$lib/components/generics/containers/Wrapper.svelte";
    import Price from "$lib/components/generics/formatters/Price.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import Modal from "$lib/components/generics/modal/Modal.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import { computeArticlePrice } from "$lib/components/derived/article/article";
    import { _ } from "svelte-i18n";

    export let data: PageData;
    export let form: ActionData;

    let editArticle = false;
    let deleteArticle = false;
    let deleteThumbnail = false;

    let articleStoreDirection: "inward" | "outward" | "moved" = "inward";
    
    $: if(form !== null && browser) { invalidateAll(); editArticle = false; }
    $: if(form !== null && form.deleteArticle === undefined) { setTimeout(() => form = null, 3000); }
        
    $: articleQuantity = data.article.store_relations.reduce((p, c) => p = p + c.quantity, 0);
    $: articlePrice = computeArticlePrice(data.article.order_rows);
    $: articlePreffedStores = data.article.store_relations.filter(sr => sr.quantity > 0).map(sr => sr.store_id);
    $: suppliers = data.article.order_rows.reduce((p, c) => [...p, c.order.supplier], new Array());
</script>

<svelte:head>
    <title>{data.article.name} - {$_('app.generic.article')} - mink</title>
</svelte:head>

{#if editArticle}
    <MenuSide on:close={() => editArticle = false} title={$_('scm.article.action.edit_article.title', { values: { name: data.article.name }})}>
        <form action="?/editArticle" method="post" use:enhanceNoReset>
            <ArticleForm bind:article={data.article} />
            <Button class="mt-3">{$_('app.action.validate')}</Button>
        </form>
    </MenuSide>
{/if}

{#if deleteArticle || form?.deleteArticle?.error === "errors.scm.article.delete.has-dependents"}
    <Modal title={form?.deleteArticle?.error !== undefined ? $_('app.action.confirm') : $_('app.generic.error')} on:close={() => { deleteArticle = false; form = null; }}>
        
        {#if form?.deleteArticle?.error}
            <p>{$_(form.deleteArticle.error)}</p>

            {#if form.deleteArticle.error === "errors.scm.article.delete.has-dependents"}
                <ul>
                    {#if form.deleteArticle.articleMovements > 0}
                        <li>{$_('errors.scm.article.delete.article-movements-over-0', { values: { n: form.deleteArticle.articleMovements }})}</li>
                    {/if}

                    {#if form.deleteArticle.storeRelations.length > 0}
                        <li>
                            {$_('errors.scm.article.delete.store-relations-over-0', { values: { n: form.deleteArticle.storeRelations.length }})}
                            <ul>
                                {#each form.deleteArticle.storeRelations as storeRelation}
                                    <li>{storeRelation.store.name} / {storeRelation.store.location} ({storeRelation.quantity})</li>
                                {/each}
                            </ul>
                        </li>
                    {/if}

                    {#if form.deleteArticle.orders.length > 0}
                        <li>
                            {$_('errors.scm.article.delete.orders-over-0', { values: { n: form.deleteArticle.orders.length }})}
                            <ul>
                                {#each form.deleteArticle.orders as order}
                                    <li>{order.name} / {order.sub_id}</li>
                                {/each}
                            </ul>
                        </li>
                    {/if}

                    {#if form.deleteArticle.assembliesWithArticle.length > 0}
                        <li>
                            {$_('errors.scm.article.delete.assemblies-with-article-over-0', { values: { n: form.deleteArticle.assembliesWithArticle.length }})
                            }
                            <ul>
                                {#each form.deleteArticle.assembliesWithArticle as assembly}
                                    <li>{assembly.name}</li>
                                {/each}
                            </ul>
                        </li>
                    {/if}
                </ul>   
            {/if}
        {:else}
            <p>{$_('scm.article.action.delete-article-confirmation', { values: { name: data.article.name }})}</p>
        {/if}

        <form slot="form" action="?/deleteArticle" method="post" class="flex gap-2" use:enhanceNoReset>
            {#if form?.deleteArticle?.error === "errors.scm.article.delete.has-dependents"}
                 <input type="hidden" name="force" value="true" />
            {/if}
            <Button role="danger" size="small" confirm={form?.deleteArticle?.error === "errors.scm.article.delete.has-dependents"}>
                {#if form?.deleteArticle?.error === "errors.scm.article.delete.has-dependents"}
                    {$_('app.action.delete-force')}
                {:else}
                    {$_('app.action.delete')}
                {/if}
            </Button>
            <Button role="tertiary" size="small" on:click={() => { deleteArticle = false; form = null }} preventSend>{$_('app.action.cancel')}</Button>
        </form>
    </Modal>
{/if}

{#if deleteThumbnail}
    <Modal title="Confirmer" on:close={() => deleteThumbnail = false}>
    
        <p>Souhaitez vous supprimer la miniature ?</p>

        <div class="flex flex-row gap-4 mt-3">            
            <form action="?/editThumbnail" method="post" use:enhanceNoReset>
                <Button role="danger" size="small">Oui</Button>
            </form>
            <Button role="tertiary" size="small" on:click={() => deleteThumbnail = false}>Non</Button>
        </div>
    </Modal>
{/if}

<div class="flex flex-row items-start gap-6 mb-6">
    <div class="w-1/5 flex flex-col gap-6">
        <Wrapper class="aspect-square relative flex flex-col justify-center">
            {#if data.article.thumbnail !== null}
                <RoundButton icon={Trash} class="absolute top-4 right-4" on:click={() => deleteThumbnail = true }/>
                <img src={data.article.thumbnail} alt="Miniature" class="aspect-square object-cover"/>
            {:else}
                <Icon src={PlusCircle} class="hover:scale-95 h-24 duration-100" />
                <p class="text-center font-bold text-lg">Pas de miniature</p>
                <p class="text-center">Glisser un fichier</p>
        {/if}
        </Wrapper>

        <h3 class="text-center">Fichiers additionels</h3>

        {#each data.article.files as file}
            <div class="bg-zinc-800 p-3 rounded-md">{file}</div>
        {/each}

        <Wrapper>
            <form action="?/addAttachedFile" method="post" use:enhance>
                <Flex direction="col" justify="between">
                    <FormInput type="file" name="attached_files" required  />
                    <Button>Ajouter le fichier</Button>
                </Flex>
            </form>
        </Wrapper>

    </div>

    <div class="grow">
        <Wrapper>
            <PillMenu>
                <PillMenuButton icon={WrenchScrewdriver} click={() => editArticle = !editArticle}>Modifier l'article</PillMenuButton>
                <PillMenuButton icon={QrCode} click={() => window.open(`/app/scm/articles/print?articles=${data.article.id}`, "_blank")}>Imprimer le QR Code</PillMenuButton>
                <form action="?/copyArticle" method="post" use:enhanceNoReset><PillMenuButton icon={DocumentDuplicate}>Copier l'article</PillMenuButton></form>
                <PillMenuButton icon={Trash} click={() => deleteArticle = true}>Supprimer l'article</PillMenuButton>
            </PillMenu>

            <h1 class="mb-2">{data.article.name}</h1>
            
            <p>Fabricant: <DetailLabel>{(data.article.internal) ? env.PUBLIC_COMPANY_NAME : data.article.brand}</DetailLabel>.</p>
            <p>Référence: <DetailLabel>{data.article.reference}</DetailLabel>.</p>
    
            {#if suppliers.length > 0}
                <h4>Fournisseurs:</h4>
                <Flex items="center" class="mt-2 mb-4">
                    {#each suppliers as supplier}
                        <Supplier {supplier} />
                    {/each}
                </Flex>
            {/if}
    
            {#if data.article.non_physical}<p class="text-amber-500 font-medium">Article non physique.</p>{/if}
    
            {#if data.article.order_rows.length > 0}
                <div class="group">
                    <p>Prix unitaire moyen pondéré: <DetailLabel><Price value={articlePrice} /></DetailLabel></p>
                    <ol class="hidden group-hover:block">
                        {#each data.article.order_rows as orderRow}
                            <li><a href="/app/scm/orders/{orderRow.order_id}">{orderRow.needed_quantity} x <Price value={orderRow.ack_price ?? 0} /></a></li>
                        {/each}
                    </ol>
                </div>
            {/if}
    
            {#if data.article.order_quantity}<p>Quantité minimale de commande: <DetailLabel>{$_(`app.generic.units_of_work_number.${data.article.unit}`, {values: { n: data.article.order_quantity / (data.article.unit_quantity ?? 1), b: data.article.unit_quantity }})}</DetailLabel>.</p>{/if}
            {#if data.article.critical_quantity}<p>Quantité critique: <DetailLabel>{$_(`app.generic.units_of_work_number.${data.article.unit}`, {values: { n: data.article.critical_quantity / (data.article.unit_quantity ?? 1), b: data.article.unit_quantity }})}</DetailLabel>.</p>{/if}
            
            <p>Quantité en stock: <DetailLabel>
                {$_(`app.generic.units_of_work_number.${data.article.unit}`, {values: { n: articleQuantity / (data.article.unit_quantity ?? 1), b: data.article.unit_quantity }})}
            </DetailLabel>.</p>
            <p>Consommable: <DetailLabel>{data.article.consumable ? "Oui" : "Non"}</DetailLabel>.</p>
    
        </Wrapper>

        {#if !data.article.non_physical}
            <Wrapper class="mt-6">
                <h4 class="mb-2">Sortie / Entrée de stock</h4>

                {#if form?.updateStock?.error}<p class="my-2 text-red-500">{$_(form.updateStock.error)}</p>{/if}

                {#if form?.updateStock?.success}<p class="my-2 text-emerald-500">{form.updateStock.success}</p>{/if}

                <form action="?/updateStock" method="post" use:enhance class="flex flex-col md:flex-row gap-4 md:items-end">

                    <FormInput type="number" name="quantity_update" label="Quantité" required value={0} min={0} />

                    <FormInput type="select" name="direction" label="Direction" required bind:value={articleStoreDirection}>
                        <option value={"inward"}>Entrée</option>
                        <option value={"outward"}>Sortie</option>
                        <option value={"moved"}>Déplacement</option>
                    </FormInput>

                    {#if articleStoreDirection === "outward" || articleStoreDirection === "moved"}

                        <FormInput type="select" name="store_out" label="Stock de provenance" required value={""}>
                            <option value={""}>—</option>

                            {#each data.stores.filter(k => articlePreffedStores.includes(k.id)) as store}
                                <option value={store.id}>{store.name} / {store.location}</option>
                            {/each}
                        </FormInput>
                    {/if}

                    {#if articleStoreDirection === "moved"}
                        <Icon src={ArrowRight} class="h-6 w-6 text-violet-500 mb-2" />
                    {/if}

                    {#if articleStoreDirection === "inward" || articleStoreDirection === "moved"}
                        <FormInput type="select" name="store_in" label="Stock de destination" required value={""}>
                            <option value={""}>—</option>

                            <optgroup label="Article déja présent">
                                {#each data.stores.filter(k => articlePreffedStores.includes(k.id)) as store}
                                    <option value={store.id}>
                                        {store.name} / {store.location}
                                    </option>
                                {/each}
                            </optgroup>

                            <optgroup label="Article non présent">
                                {#each data.stores.filter(k => !articlePreffedStores.includes(k.id)) as store}
                                    <option value={store.id}>
                                        {store.name} / {store.location}
                                    </option>
                                {/each}
                            </optgroup>
                        </FormInput>
                    {/if}

                    <Button>Modifier la quantité en stock</Button>
                </form>
            </Wrapper>

            <Flex direction="col" gap={6} class="mt-6">
                {#if data.article.store_relations.length > 0}
                    <Table headers={[{ label: "Emplacement" }, { label: "Quantité" }]}>
                        {#each data.article.store_relations as storeRelation}
                            <TableCell><Store store={storeRelation.store} /></TableCell>
                            <TableCell>{storeRelation.quantity}</TableCell>
                        {/each}
                    </Table>
                {/if}

                {#if data.article.acticle_movements.length > 0}
                    <Table headers={[{ label: "𝚫 Quantité" }, { label: "Utilisateur" }, { label: "Déplacement" }, { label: "Date" }]}>
                            {#each data.article.acticle_movements as movement}
                                <TableCell>{$_(`app.generic.units_of_work_number.${data.article.unit}`, {values: { n: movement.quantity_update / (data.article.unit_quantity ?? 1), b: data.article.unit_quantity }})}</TableCell>
                                <TableCell>
                                    <User user={movement.user} />
                                </TableCell>
                                <TableCell>
                                    <Flex items="center" gap={2}>
                                        <span>{movement.store_out?.name ?? "Inconnu"}</span>
                                        <Icon src={ArrowRight} class="h-4 w-4 inline-block text-violet-500" />
                                        <span>{movement.store_in?.name ?? "Inconnu"}</span>
                                    </Flex>
                                </TableCell>
                                <TableCell>{movement.created}</TableCell>
                            {/each}
                    </Table>
                {/if}
            </Flex>

        {/if}
    </div>
</div>