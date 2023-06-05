<script lang="ts">
    import { browser } from "$app/environment";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
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
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { ArrowLeft, ArrowRight, Check, DocumentDuplicate, PlusCircle, QrCode, Trash, Wrench } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { ActionData, PageData } from "./$types";
    import Grid from "$lib/components/layout/grid.svelte";
    import Price from "$lib/components/formatters/Price.svelte";
    import { returnArticleUnit } from "$lib/components/article/artictleUnits";
    import Store from "$lib/components/store/Store.svelte";

    export let data: PageData;
    export let form: ActionData;

    let editArticle = false;
    let showConfirmDelete = false;

    let createTag = false;
    let editTag: undefined | string = undefined;

    let selectedFile: number = (data.article.attached_files === undefined) ? -1 : 0;

    let articleStoreDirection: "inward" | "outward" | "moved" = "inward";
    
    $: if(form !== null && browser) { invalidateAll(); editArticle = false; }
    $: if(form !== null) { setTimeout(() => form = null, 3000); }
    $: if(form?.editTag !== undefined) { editTag = undefined }
    $: if(showConfirmDelete === true) { setTimeout(() => showConfirmDelete = false, 3000); }
    
    $: articleQuantity = data.storeRelations.filter(sr => (sr.expand?.store?.temporary ?? true) === false).reduce((p, c) => p = p + (c.quantity ?? 0), 0);
    $: exploitableStoreRelations = data.storeRelations.filter(k => (k.quantity ?? 0) > 0 && !k.expand?.store.temporary)
    $: articlePreffedStores = data.storeRelations.filter(k => (k.quantity ?? 0) > 0).map(k => k.store);

</script>

<svelte:head>
    <title>Article — {data.article.name}</title>
</svelte:head>

<div class="flex flex-col-reverse md:flex-row gap-6 md:items-start">
    <Wrapper class="relative grow">
        {#if !editArticle}
        
            {#if form?.delete?.error !== undefined}<h4>{form.delete?.error}</h4>{/if}
            <h2 class="mb-2">{data.article.name}</h2>
            
            {#if data.article.expand?.supplier !== undefined}
                <h4>Fournisseurs:</h4>
                <Flex items="center" class="mt-2 mb-4">
                    {#each data.article.expand?.supplier as supplier}
                        <Supplier {supplier} />
                    {/each}
                </Flex>
            {/if}

            <p>Fabricant: <DetailLabel>{data.article.manufacturer}</DetailLabel>.</p>
            <p>Référence: <DetailLabel>{data.article.reference}</DetailLabel>.</p>
            <p>Prix unitaire: <DetailLabel>{(data.article.price !== 0) ? data.article.price : "—"} €</DetailLabel>.</p>
            {#if data.article.non_physical}<p class="text-amber-500 font-medium">Article non physique.</p>{/if}

            {#if data.orderRows.length > 0}
                <div class="group">
                    <p>Prix unitaire moyen pondéré: <DetailLabel><Price value={data.orderRows.reduce((p, c) => p = p + (c.ack_price ?? 0) * c.quantity, 0) / data.orderRows.reduce((p, c) => p = p + c.quantity, 0)} /></DetailLabel></p>
                    <ol class="hidden group-hover:block">
                        {#each data.orderRows as orderRow}
                            <li><a href="/app/orders/{orderRow.order}">{orderRow.quantity} x <Price value={orderRow.ack_price ?? 0} /></a></li>
                        {/each}
                    </ol>
                </div>
            {/if}
            {#if data.article.order_quantity}<p>Quantité minimale de commande: <DetailLabel>{returnArticleUnit(data.article.unit, data.article.unit_quantity, data.article.order_quantity)}</DetailLabel>.</p>{/if}
            <p>Quantité en stock: <DetailLabel>{returnArticleUnit(data.article.unit, data.article.unit_quantity, articleQuantity)}</DetailLabel>.</p>

            {#if data.article.critical_quantity}<p>Quantité critique: <DetailLabel>{returnArticleUnit(data.article.unit, data.article.unit_quantity, data.article.critical_quantity)}</DetailLabel>.</p>{/if}
            <p>Consommable: <DetailLabel>{data.article.consumable ? "Oui" : "Non"}</DetailLabel>.</p>

            {#if data.article.expand?.store}<p>Emplacements ( à convertir ): <DetailLabel>{data.article.expand.store.location} / {data.article.expand.store.name}</DetailLabel></p>{/if}

            <PillMenu>
                <PillMenuButton icon={Wrench} click={() => { editArticle = !editArticle; }}>Modifier l'article</PillMenuButton>
                <form action="?/copyArticle" method="post" use:enhance>
                    <PillMenuButton icon={DocumentDuplicate} role="secondary">
                        Copier l'article
                    </PillMenuButton>
                </form>

                <PillMenuButton icon={QrCode} role="secondary" click={() => window.open(`/app/articles/print/?articles=${data.article.id}`, '_blank')?.focus()}>Imprimer l'etiquette</PillMenuButton>

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

    <Wrapper class="h-96 shrink-0 aspect-square mx-auto relative p-0 overflow-hidden">
        {#if data.article.attached_files?.[selectedFile] === undefined || selectedFile === -1}
            <Flex justify="between" direction="col">
                <h4>Ajouter un fichier</h4>
                <form action="?/addAttachedFile" method="post" use:enhance>
                    <Flex direction="col" items="start">
                        <FormInput type="file" name="attached_files" label="Fichier a ajouter" labelMandatory={true}  />
                        <Button>Ajouter le fichier</Button>
                    </Flex>
                </form>
            </Flex>
        {:else if data.article.attached_files[selectedFile] !== undefined}
            <File fileName={data.article.attached_files[selectedFile]} fancyFileName={data.article.reference} collectionName={data.article.collectionName} collectionID={data.article.id} isPinned={data.article.pinned_file === data.article.attached_files[selectedFile]} />
        {/if}

        <Flex items="center" justify="between" class="absolute bottom-4 left-4 right-4">
            <RoundButton icon={ArrowLeft} on:click={() => selectedFile = selectedFile <= -1 ? -1 : selectedFile - 1} />
            <RoundButton icon={ArrowRight} on:click={() => selectedFile = selectedFile >= (data.article.attached_files?.length ?? -1) ? (data.article.attached_files?.length ?? -1) : selectedFile + 1} />
        </Flex>
    </Wrapper>
</div>

{#if !data.article.non_physical}

    <Wrapper class="mt-6">
        <h4 class="mb-2">Sortie / Entrée de stock</h4>

        {#if form?.updateStock?.error}
            <p class="my-2 text-red-500">{form.updateStock.error}</p>
        {/if}

        {#if form?.updateStock?.success}
            <p class="my-2 text-emerald-500">{form.updateStock.success}</p>
        {/if}

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

                    {#each data.stores.filter(k => !k.temporary && articlePreffedStores.includes(k.id)) as store}
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
                        {#each data.stores.filter(k => !k.temporary && articlePreffedStores.includes(k.id)) as store}
                            <option value={store.id}>
                                {store.name} / {store.location}
                            </option>
                        {/each}
                    </optgroup>

                    <optgroup label="Article non présent">
                        {#each data.stores.filter(k => !k.temporary && !articlePreffedStores.includes(k.id)) as store}
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

    <Grid gap={6} cols={data.articleMovements.length > 0 ? 2 : 1} items="start" class="mt-6">

        <Flex direction="col" gap={6}>
            {#if exploitableStoreRelations.length > 0}
                <Table marginTop="">
                    <svelte:fragment slot="head">
                        <TableHead>Emplacement</TableHead>
                        <TableHead>Quantité</TableHead>
                    </svelte:fragment>
                    <svelte:fragment slot="body">
                        {#each exploitableStoreRelations as storeRelation}
                            <TableRow>
                                <TableCell><Store store={storeRelation.expand?.store} /></TableCell>
                                <TableCell>{storeRelation.quantity}</TableCell>
                            </TableRow>
                        {/each}
                    </svelte:fragment>
                </Table>
            {/if}

            {#if data.articleMovements.length > 0}
                <Table marginTop="">
                    <svelte:fragment slot="head">
                        <TableHead>Δ Quantité</TableHead>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Déplacement</TableHead>
                        <TableHead class="hidden md:table-cell">Date</TableHead>
                    </svelte:fragment>

                    <svelte:fragment slot="body">
                        {#each data.articleMovements as movement}
                            <TableRow>
                                <TableCell>{returnArticleUnit(data.article.unit, data.article.unit_quantity, movement.quantity_update)}</TableCell>
                                <TableCell>
                                    {#if movement.expand?.user !== undefined}
                                        <User user={movement.expand.user} />
                                    {:else}
                                        —
                                    {/if}
                                </TableCell>
                                <TableCell>
                                    <Flex items="center" gap={2}>
                                        <span>{movement.expand?.store_out?.name ?? "Inconnu"}</span>
                                        <Icon src={ArrowRight} class="h-4 w-4 inline-block text-violet-500" />
                                        <span>{movement.expand?.store_in?.name ?? "Inconnu"}</span>
                                    </Flex>
                                </TableCell>
                                <TableCell class="hidden md:table-cell">{movement.created}</TableCell>
                            </TableRow>
                        {/each}
                    </svelte:fragment>
                </Table>
            {/if}
        </Flex>

        <Wrapper>
            <h4>Tags article</h4>

            <PillMenu>
                <PillMenuButton icon={PlusCircle} click={() => createTag = !createTag}>Créer un tag</PillMenuButton>
            </PillMenu>

            <Table marginTop="" embeded>
                <svelte:fragment slot="head">
                    <TableHead>Tag</TableHead>
                    <TableHead>Valeur</TableHead>
                </svelte:fragment>

                <svelte:fragment slot="body">
                    {#each data.articleTags as tag}
                        {#if tag.id === editTag}
                            <TableRow>
                                <TableCell>
                                    {tag.expand?.tag.name}
                                </TableCell>
                                <TableCell>
                                    <form action="?/editTag" method="post" use:enhance>
                                        <Flex items="end" gap={6}>
                                            <FormInput type="text" name="value" label="Valeur" labelMandatory value={tag.value} />
                                            <input type="hidden" name="id" value={tag.id} />
                                            <Button role="success">Valider</Button>
                                        </Flex>
                                    </form>
                                </TableCell>
                            </TableRow>
                        {:else}
                            <TableRow>
                                <TableCell>{tag.expand?.tag.name}</TableCell>
                                <TableCell>
                                    {tag.value}
                                    <button on:click={() => editTag = tag.id}><Icon src={Wrench} class="h-4 w-4 ml-2 text-orange-500" /></button>
                                </TableCell>
                            </TableRow>
                        {/if}
                    {:else}
                        <TableRow>
                            <TableCell colspan={2}>Aucun tag</TableCell>
                        </TableRow>
                    {/each}
                </svelte:fragment>
            </Table>

            <section class="mt-6">
                {#if data.tags.length > 0 && !createTag}
                    <h5>Ajouter un tag</h5>
                    {#if form?.addTag?.error}<p class="text-red-500">{form?.addTag?.error}</p>{/if}
                    <form action="?/addTag" method="post" use:enhance class="mt-2">
                        <Flex items="end" gap={6}>
                            <FormInput type="select" name="tag" label="Tag" labelMandatory>
                                {#each data.tags as tag}
                                    <option value={tag.id}>{tag.name}</option>
                                {/each}
                            </FormInput>
                            <FormInput type="text" name="value" label="Valeur" labelMandatory />
                            <Button>Ajouter le tag</Button>
                        </Flex>
                    </form>
                {/if}
                {#if data.tags.length === 0 || createTag}
                    <h5>Créer un tag</h5>
                    {#if form?.createTag?.error}<p class="text-red-500">{form?.createTag?.error}</p>{/if}
                    <form action="?/createTag" method="post" use:enhance class="mt-2">
                        <Flex items="end" gap={6}>
                            <FormInput type="text" name="name" label="Nom du tag" labelMandatory />
                            <Button>Créer le tag</Button>
                        </Flex>
                    </form>
                {/if}
            </section>
            
        </Wrapper>
    </Grid>

{/if}