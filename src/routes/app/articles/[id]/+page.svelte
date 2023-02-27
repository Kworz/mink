<script lang="ts">
    import { browser } from "$app/environment";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import File from "$lib/components/file/File.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Grid from "$lib/components/layout/grid.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import User from "$lib/components/user/User.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { Check, Wrench } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    let editArticle = false;
    let showConfirmDelete = false;

    $: if(form !== null && browser) { invalidateAll(); editArticle = false; }
    $: if(showConfirmDelete === true) { setTimeout(() => showConfirmDelete = false, 3000); }

</script>

<svelte:head>
    <title>Article — {data.article.name}</title>
</svelte:head>

<Grid cols={2} gap={6}>
    {#if !editArticle}
        <section>
            <h2>{data.article.name}</h2>
            {#if form?.edit !== undefined}
                {#if form.edit.success}<p class="text-emerald-500">{form.edit.success}</p>{/if}
                {#if form.edit.error}<p class="text-red-500">{form.edit.error}</p>{/if}
            {/if}
            <h4>Informations générales</h4>
            <p>Fabricant: <DetailLabel>{data.article.manufacturer}</DetailLabel>.</p>
            <p>Référence: <DetailLabel>{data.article.reference}</DetailLabel>.</p>
            <p>Fournisseur: <DetailLabel>{data.article.expand?.supplier?.name ?? "—"}</DetailLabel>.</p>
            <p>Prix unitaire: <DetailLabel>{(data.article.price !== 0) ? data.article.price : "—"} €</DetailLabel>.</p>
            <p>Quantité en stock: <DetailLabel>{data.article.quantity}</DetailLabel>.</p>

            <Flex class="my-6" items="center">
                <Button size="small" on:click={() => editArticle = !editArticle}>
                    <Icon src={Wrench} class="h-4 w-4 inline-block mr-2" />
                    Modifier l'article
                </Button>

                <form action="?/copyArticle" method="post" use:enhance>
                    <Button size="small" borderColor="border-blue-500" hoverColor="hover:bg-blue-500">Copier l'article</Button>
                </form>

                {#if showConfirmDelete}
                    <form action="?/deleteArticle" method="post" use:enhance>
                        <Button size="small"borderColor="border-red-500" hoverColor="hover:bg-red-500">Confirmer la suppréssion</Button>
                    </form>
                {:else}
                    <Button on:click={() => showConfirmDelete = true} size="small" borderColor="border-red-500" hoverColor="hover:bg-red-500">Supprimer l'article</Button>                
                {/if}

            </Flex>
        </section>
    {:else}
        <Wrapper>
            <form action="?/editArticle" method="post" use:enhanceNoReset>
                <Flex direction="col" gap={2}>
                    <FormInput name="name" label="Nom de l'article" labelMandatory={true} bind:value={data.article.name} backgroundColor="bg-white"/>
                    <FormInput name="quantity" type="number" label="Quantité en stock" labelMandatory={true} bind:value={data.article.quantity} backgroundColor="bg-white"/>
                    <FormInput name="price" type="number" label="Prix" step={0.01} bind:value={data.article.price} backgroundColor="bg-white" />
                    <FormInput name="reference" label="Référence" bind:value={data.article.reference} backgroundColor="bg-white" />
                    <FormInput type="select" name="supplier" label="Fournisseur" bind:value={data.article.supplier} backgroundColor="bg-white">
                        <option value={undefined}>—</option>
                        {#each data.suppliers as supplier}
                            <option value={supplier.id}>{supplier.name}</option>
                        {/each}
                    </FormInput>
                    <FormInput name="manufacturer" label="Fabricant" bind:value={data.article.manufacturer} backgroundColor="bg-white"/>       
                </Flex>
                
                <Flex items="center" class="mt-4">
                    <Button size="small" borderColor="border-amber-500" hoverColor="hover:bg-amber-500">
                        <Icon src={Check} class="h-4 w-4 inline-block mr-2" />
                        Modifier
                    </Button>     
                    <Button size="small" borderColor="border-red-500" hoverColor="hover:bg-red-500" on:click={() => editArticle = !editArticle}>
                        <Icon src={Wrench} class="h-4 w-4 inline-block mr-2" />
                        Annuler la modification
                    </Button>
                </Flex>
            </form> 
        </Wrapper>
    {/if}

    <Flex direction="col" gap={6}>
        <Wrapper>
            <h3>Ajouter a une nomenclature</h3>

            {#if form?.addToNomenclature !== undefined}
                {#if form.addToNomenclature.success} <p class="text-emerald-500">{form.addToNomenclature.success}</p> {/if}
                {#if form.addToNomenclature.error} <p class="text-red-500">{form.addToNomenclature.error}</p> {/if}
            {/if}

            <form action="?/addToNomenclature" method="post" use:enhanceNoReset>
                <Flex items="end">
            
                    <FormInput name="parent_nomenclature" type="select" label="nomenclature" labelMandatory={true} backgroundColor="white">
                        {#each data.nomenclatures as nomenclature}
                            <option value={nomenclature.id}>{nomenclature.name}</option>
                        {/each}
                    </FormInput>
            
                    <FormInput name="item_quantity" type="number" min={0} label="Quantité requise" labelMandatory={true} value={0} backgroundColor="white"/>
                    <Button>Ajouter</Button>
                </Flex>
            </form>
        </Wrapper>

        {#if data.articleMovements.length > 0}
            <Table marginTop="">
                <svelte:fragment slot="head">
                    <TableHead>Movement quantité</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Date</TableHead>
                </svelte:fragment>

                <svelte:fragment slot="body">
                    {#each data.articleMovements as movement}
                        <TableRow>
                            <TableCell>{movement.quantity_update}</TableCell>
                            <TableCell>{movement.reason ?? "—"}</TableCell>
                            <TableCell>
                                {#if movement.expand?.user !== undefined}
                                    <User user={movement.expand.user} />
                                {:else}
                                    —
                                {/if}
                            </TableCell>
                            <TableCell>{movement.created}</TableCell>
                        </TableRow>
                    {/each}
                </svelte:fragment>
            </Table>
        {/if}
    </Flex>
</Grid>

<Wrapper class="mt-6">
    <h3 class="mb-3">Fichiers liés</h3>
    <Grid cols={8}>
        <div class="p-4 rounded-[3px] border border-zinc-500/50 aspect-[2/1] col-span-2 bg-white">
            <Flex justify="between" direction="col">
                <h4>Ajouter un fichier</h4>
                <form action="?/addAttachedFile" method="post" use:enhance>
                    <Flex direction="col" items="start">
                        <FormInput type="file" name="attached_files" label="Fichier a ajouter" labelMandatory={true} />
                        <Button>Ajouter le fichier</Button>
                    </Flex>
                </form>
            </Flex>
        </div>

        {#if data.article.attached_files !== undefined}
            {#each data.article.attached_files as file}
                <File fileName={file} collectionName={data.article.collectionName} collectionID={data.article.id} isPinned={data.article.pinned_file === file} />
            {/each}
        {/if}
    </Grid>
</Wrapper>