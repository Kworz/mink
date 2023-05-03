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

    export let data: PageData;
    export let form: ActionData;

    let editArticle = false;
    let showConfirmDelete = false;

    let createTag = false;
    let editTag: undefined | string = undefined;

    let selectedFile: number = (data.article.attached_files === undefined) ? -1 : 0;

    $: if(form !== null && browser) { invalidateAll(); editArticle = false; }
    $: if(form !== null) { setTimeout(() => form = null, 3000); }
    $: if(form?.editTag !== undefined) { editTag = undefined }
    $: if(showConfirmDelete === true) { setTimeout(() => showConfirmDelete = false, 3000); }

</script>

<svelte:head>
    <title>Article — {data.article.name}</title>
</svelte:head>

<div class="flex flex-col-reverse md:flex-row gap-6">
    <Wrapper class="relative grow">
        {#if !editArticle}
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
            {#if data.orderRows.length > 0}<p>Prix unitaire moyen pondéré: <DetailLabel><Price value={data.orderRows.reduce((p, c) => p = p + (c.ack_price ?? 0), 0) / data.orderRows.length} /></DetailLabel> ({data.orderRows.length} commandes)</p>{/if}
            {#if data.article.order_quantity}<p>Quantité minimale de commande: <DetailLabel>{data.article.order_quantity} {data.article.unit || "pièces"}</DetailLabel>.</p>{/if}
            <p>Quantité en stock: <DetailLabel>{data.article.quantity} {data.article.unit || "pièces"}</DetailLabel>.</p>

            {#if data.article.critical_quantity}<p>Quantité critique: <DetailLabel>{data.article.critical_quantity} {data.article.unit || "pièces"}</DetailLabel>.</p>{/if}
            <p>Consommable: <DetailLabel>{data.article.consumable ? "Oui" : "Non"}</DetailLabel>.</p>

            {#if data.article.expand?.store}
                <p>Emplacement: <DetailLabel>{data.article.expand.store.location} / {data.article.expand.store.name}</DetailLabel></p>
            {/if}

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

<Wrapper class="mt-6">
    <h4 class="mb-2">Sortie / Entrée de stock</h4>

    {#if form?.updateStock?.error}
        <p class="my-2 text-red-500">{form.updateStock.error}</p>
    {/if}

    {#if form?.updateStock?.success}
        <p class="my-2 text-emerald-500">{form.updateStock.success}</p>
    {/if}

    <form action="?/updateStock" method="post" use:enhanceNoReset class="flex flex-col md:flex-row gap-4 md:items-end">
        <FormInput type="number" name="quantity_update" label="Quantité" labelMandatory value={0} />
        <FormInput type="select" name="direction" label="Direction" labelMandatory value={-1}>
            <option value={-1}>Sortie</option>
            <option value={1}>Entrée</option>
        </FormInput>
        <FormInput type="text" name="reason" label="Raison" labelMandatory value={"Sortie de stock"} />
        <Button>Modifier la quantité en stock</Button>
    </form>
</Wrapper>

<Grid gap={6} cols={data.articleMovements.length > 0 ? 2 : 1} items="start" class="mt-6">
    {#if data.articleMovements.length > 0}
        <Table marginTop="">
            <svelte:fragment slot="head">
                <TableHead>Δ Quantité</TableHead>
                <TableHead class="hidden md:table-cell">Raison</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead class="hidden md:table-cell">Date</TableHead>
            </svelte:fragment>

            <svelte:fragment slot="body">
                {#each data.articleMovements as movement}
                    <TableRow>
                        <TableCell>{movement.quantity_update}</TableCell>
                        <TableCell class="hidden md:table-cell">{movement.reason ?? "—"}</TableCell>
                        <TableCell>
                            {#if movement.expand?.user !== undefined}
                                <User user={movement.expand.user} />
                            {:else}
                                —
                            {/if}
                        </TableCell>
                        <TableCell class="hidden md:table-cell">{movement.created}</TableCell>
                    </TableRow>
                {/each}
            </svelte:fragment>
        </Table>
    {/if}
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