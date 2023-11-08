<script lang="ts">
    import { browser } from "$app/environment";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { returnArticleUnit } from "$lib/components/article/artictleUnits";
    import { env } from "$env/dynamic/public";
    import type { ActionData, PageData } from "./$types";

    import { ArrowRight, Check, DocumentDuplicate, QrCode, Trash, Wrench } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";

    import ArticleForm from "$lib/components/article/ArticleForm.svelte";
    import Button from "$lib/components/Button.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import File from "$lib/components/file/File.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import RoundButton from "$lib/components/RoundButton.svelte";
    import Supplier from "$lib/components/supplier/Supplier.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import User from "$lib/components/user/User.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import Price from "$lib/components/formatters/Price.svelte";
    import Store from "$lib/components/store/Store.svelte";
    import Grid from "$lib/components/layout/grid.svelte";

    export let data: PageData;
    export let form: ActionData;

    let editArticle = false;
    let showConfirmDelete = false;

    let selectedFile: "thumbnail" | number = "thumbnail";

    let articleStoreDirection: "inward" | "outward" | "moved" = "inward";
    
    $: if(form !== null && browser) { invalidateAll(); editArticle = false; }
    $: if(form !== null) { setTimeout(() => form = null, 3000); }
    $: if(showConfirmDelete === true) { setTimeout(() => showConfirmDelete = false, 3000); }
        
    $: articleQuantity = data.article.store_relations.filter(sr => !sr.store.temporary).reduce((p, c) => p = p + c.quantity, 0);
    $: articlePrice = data.article.order_rows.filter(or => [""].includes(or.order.state)).reduce((p, c) => p = p + ((c.ack_price ?? 0) * c.received_quantity), 0) / articleQuantity;
    $: exploitableStoreRelations = data.article.store_relations.filter(sr => !sr.store.temporary && sr.quantity > 0);
    $: articlePreffedStores = data.article.store_relations.filter(sr => sr.quantity > 0).map(sr => sr.store_id);
    $: suppliers = data.article.order_rows.reduce((p, c) => [...p, c.order.supplier], new Array());
</script>

<svelte:head>
    <title>Article — {data.article.name}</title>
</svelte:head>

<div class="flex flex-col-reverse md:flex-row gap-6 md:items-start">
    <Wrapper class="relative grow">
        {#if !editArticle}
        
            {#if form?.delete?.error !== undefined}<h4>{form.delete?.error}</h4>{/if}
            <h2 class="mb-2">{data.article.name}</h2>
            
            {#if suppliers.length > 0}
                <h4>Fournisseurs:</h4>
                <Flex items="center" class="mt-2 mb-4">
                    {#each suppliers as supplier}
                        <Supplier {supplier} />
                    {/each}
                </Flex>
            {/if}

            <p>Fabricant: <DetailLabel>{(data.article.internal) ? env.PUBLIC_COMPANY_NAME : data.article.brand}</DetailLabel>.</p>
            
            <p>Référence: <DetailLabel>{data.article.reference}</DetailLabel>.</p>
            
            {#if data.article.non_physical}<p class="text-amber-500 font-medium">Article non physique.</p>{/if}

            {#if data.article.order_rows.length > 0}
                <div class="group">
                    <p>Prix unitaire moyen pondéré: <DetailLabel><Price value={articlePrice} /></DetailLabel></p>
                    <ol class="hidden group-hover:block">
                        {#each data.article.order_rows as orderRow}
                            <li><a href="/app/scm/orders/{orderRow.order}">{orderRow.received_quantity} x <Price value={orderRow.ack_price ?? 0} /></a></li>
                        {/each}
                    </ol>
                </div>
            {/if}

            {#if data.article.order_quantity}<p>Quantité minimale de commande: <DetailLabel>{returnArticleUnit(data.article.unit, data.article.unit_quantity, data.article.order_quantity)}</DetailLabel>.</p>{/if}
            
            <p>Quantité en stock: <DetailLabel>{returnArticleUnit(data.article.unit, data.article.unit_quantity, articleQuantity)}</DetailLabel>.</p>

            {#if data.article.critical_quantity}<p>Quantité critique: <DetailLabel>{returnArticleUnit(data.article.unit, data.article.unit_quantity, data.article.critical_quantity)}</DetailLabel>.</p>{/if}
            
            <p>Consommable: <DetailLabel>{data.article.consumable ? "Oui" : "Non"}</DetailLabel>.</p>

            <PillMenu>
                <PillMenuButton icon={Wrench} click={() => { editArticle = !editArticle; }}>Modifier l'article</PillMenuButton>
                <form action="?/copyArticle" method="post" use:enhance>
                    <PillMenuButton icon={DocumentDuplicate} role="secondary">
                        Copier l'article
                    </PillMenuButton>
                </form>

                <PillMenuButton icon={QrCode} role="secondary" click={() => window.open(`/app/scm/articles/print/?articles=${data.article.id}`, '_blank')?.focus()}>Imprimer l'etiquette</PillMenuButton>

                {#if showConfirmDelete}
                    <form action="?/deleteArticle" method="post" use:enhance>
                        <PillMenuButton icon={Trash} role="danger">Confirmer la suppression</PillMenuButton>
                    </form>
                {:else}
                    <PillMenuButton icon={Trash} click={() => { showConfirmDelete = true; return false;}} role="danger">Supprimer l'article</PillMenuButton>                
                {/if}
            </PillMenu>
        {:else}
            <form action="?/editArticle" method="post" use:enhanceNoReset>

                <ArticleForm article={data.article} />
                
                <Flex items="center" class="mt-4">
                    <Button role="warning">
                        <Icon src={Check} class="h-4 w-4 inline-block mr-2" />
                        Modifier
                    </Button>
                    <Button role="danger" on:click={() => editArticle = !editArticle}>
                        <Icon src={Wrench} class="h-4 w-4 inline-block mr-2" />
                        Annuler la modification
                    </Button>
                </Flex>
            </form>
        {/if}
    </Wrapper>

    <Wrapper class="w-1/3 shrink-0 mx-auto relative p-0 overflow-hidden">
        <h4 class="mb-2">Fichiers</h4>

        <Grid cols={1} gap={2}>
            <div class="p-2 ring-inset ring-2 ring-zinc-200 rounded-xl">
                <h5 class="text-center p-1">Miniature</h5>

                {#if data.article.thumbnail === null}
                    <Flex justify="between" direction="col">
                        <form action="?/modifyThumbnail" method="post" use:enhance>
                            <Flex direction="row" justify="between">
                                <FormInput type="file" name="attached_files" labelMandatory={true} />
                                <Button>Ajouter une miniature</Button>
                            </Flex>
                        </form>
                    </Flex>
                {:else if data.article.attached_files[selectedFile] !== undefined}
                    <File fileName={data.article.attached_files[selectedFile]} fancyFileName={data.article.reference} collectionName={data.article.collectionName} collectionID={data.article.id} isPinned={data.article.pinned_file === data.article.attached_files[selectedFile]} />
                {/if}
            </div>   
            
            {#each data.article.files as file}
                <div class="p-2 ring-inset ring-2 ring-zinc-200 rounded-xl">
                    {file}
                </div>    
            {/each}

            <div class="p-2 ring-inset ring-2 ring-zinc-200 rounded-xl">
                <form action="?/addAttachedFile" method="post" use:enhance>
                    <Flex direction="row" justify="between">
                        <FormInput type="file" name="attached_files" labelMandatory={true}  />
                        <Button>Ajouter le fichier</Button>
                    </Flex>
                </form>
            </div> 
        </Grid>
    </Wrapper>
</div>

{#if !data.article.non_physical}

    <Wrapper class="mt-6">
        <h4 class="mb-2">Sortie / Entrée de stock</h4>

        {#if form?.updateStock?.error}<p class="my-2 text-red-500">{form.updateStock.error}</p>{/if}

        {#if form?.updateStock?.success}<p class="my-2 text-emerald-500">{form.updateStock.success}</p>{/if}

        <form action="?/updateStock" method="post" use:enhance class="flex flex-col md:flex-row gap-4 md:items-end">

            <FormInput type="number" name="quantity_update" label="Quantité" labelMandatory value={0} min={0} />

            <FormInput type="select" name="direction" label="Direction" labelMandatory bind:value={articleStoreDirection}>
                <option value={"inward"}>Entrée</option>
                <option value={"outward"}>Sortie</option>
                <option value={"moved"}>Déplacement</option>
            </FormInput>

            {#if articleStoreDirection === "outward" || articleStoreDirection === "moved"}

                <FormInput type="select" name="store_out" label="Stock de provenance" labelMandatory value={""}>
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
                <FormInput type="select" name="store_in" label="Stock de destination" labelMandatory value={""}>
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
        {#if exploitableStoreRelations.length > 0}
            <Table marginTop="">
                <svelte:fragment slot="head">
                    <TableHead>Emplacement</TableHead>
                    <TableHead>Quantité</TableHead>
                </svelte:fragment>
                <svelte:fragment slot="body">
                    {#each exploitableStoreRelations as storeRelation}
                        <TableRow>
                            <TableCell><Store store={storeRelation.store} /></TableCell>
                            <TableCell>{storeRelation.quantity}</TableCell>
                        </TableRow>
                    {/each}
                </svelte:fragment>
            </Table>
        {/if}

        {#if data.article.acticle_movements.length > 0}
            <Table marginTop="">
                <svelte:fragment slot="head">
                    <TableHead>Δ Quantité</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Déplacement</TableHead>
                    <TableHead class="hidden md:table-cell">Date</TableHead>
                </svelte:fragment>

                <svelte:fragment slot="body">
                    {#each data.article.acticle_movements as movement}
                        <TableRow>
                            <TableCell>{returnArticleUnit(data.article.unit, data.article.unit_quantity, movement.quantity_update)}</TableCell>
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
                            <TableCell class="hidden md:table-cell">{movement.created}</TableCell>
                        </TableRow>
                    {/each}
                </svelte:fragment>
            </Table>
        {/if}
    </Flex>

{/if}