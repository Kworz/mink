<script lang="ts">
    import { browser } from "$app/environment";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import File from "$lib/components/file/File.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import RoundButton from "$lib/components/RoundButton.svelte";
    import Supplier from "$lib/components/supplier/Supplier.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import User from "$lib/components/user/User.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { ArrowLeft, ArrowRight, Check, PlusCircle, Wrench } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    let editArticle = false;
    let showConfirmDelete = false;

    let selectedFile: number = -1;

    $: if(form !== null && browser) { invalidateAll(); editArticle = false; }
    $: if(showConfirmDelete === true) { setTimeout(() => showConfirmDelete = false, 3000); }

</script>

<svelte:head>
    <title>Article — {data.article.name}</title>
</svelte:head>

<Flex gap={6} justify="between">
    <Wrapper class="relative grow">
        {#if !editArticle}
            <h2>{data.article.name}</h2>
            <p>Fabricant: <DetailLabel>{data.article.manufacturer}</DetailLabel>.</p>
            <p>Référence: <DetailLabel>{data.article.reference}</DetailLabel>.</p>

            {#if data.article.expand?.supplier !== undefined}
                <Flex items="center">
                    <span>Fournisseurs:</span>
                    <Flex items="center">
                        {#each data.article.expand?.supplier as supplier}
                            <Supplier {supplier} />
                        {/each}
                    </Flex>
                </Flex>
            {/if}


            <p>Prix unitaire: <DetailLabel>{(data.article.price !== 0) ? data.article.price : "—"} €</DetailLabel>.</p>
            {#if data.article.order_quantity}<p>Quantité minimale de commande: <DetailLabel>{data.article.order_quantity}</DetailLabel>.</p>{/if}
            <p>Quantité en stock: <DetailLabel>{data.article.quantity}</DetailLabel>.</p>

            <div class="absolute top-4 right-4">
                <PillMenu>
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
    
                    <Button size="small" borderColor="border-pink-500" hoverColor="hover:bg-pink-500" on:click={() => 
                            window.open(`/app/articles/print/?articles=${data.article.id}`, '_blank')?.focus()
                    }>
                        Imprimer l'etiquette
                    </Button>
                </PillMenu>
            </div>
        {:else}
            <form action="?/editArticle" method="post" use:enhanceNoReset>
                <Flex direction="col" gap={2}>
                    <FormInput name="name" label="Nom de l'article" labelMandatory={true} bind:value={data.article.name} backgroundColor="bg-white"/>

                    <FormInput name="quantity" type="number" label="Quantité en stock" labelMandatory={true} bind:value={data.article.quantity} backgroundColor="bg-white"/>
                    <FormInput name="order_quantity" type="number" label="Quantité minimale de commande" bind:value={data.article.order_quantity} backgroundColor="bg-white"/>

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
                    <Button size="small" role="warning">
                        <Icon src={Check} class="h-4 w-4 inline-block mr-2" />
                        Modifier
                    </Button>     
                    <Button size="small" role="danger" on:click={() => editArticle = !editArticle}>
                        <Icon src={Wrench} class="h-4 w-4 inline-block mr-2" />
                        Annuler la modification
                    </Button>
                </Flex>
            </form> 
        {/if}
    </Wrapper>

    <Wrapper class="h-96 shrink-0 aspect-square relative p-0 overflow-hidden">
        {#if data.article.attached_files?.[selectedFile] === undefined || selectedFile === -1}
            <Flex justify="between" direction="col">
                <h4>Ajouter un fichier</h4>
                <form action="?/addAttachedFile" method="post" use:enhance>
                    <Flex direction="col" items="start">
                        <FormInput type="file" name="attached_files" label="Fichier a ajouter" labelMandatory={true} backgroundColor="bg-white" />
                        <Button>Ajouter le fichier</Button>
                    </Flex>
                </form>
            </Flex>
        {:else if data.article.attached_files[selectedFile] !== undefined}
            <File fileName={data.article.attached_files[selectedFile]} collectionName={data.article.collectionName} collectionID={data.article.id} isPinned={data.article.pinned_file === data.article.attached_files[selectedFile]} />
        {/if}

        <Flex items="center" justify="between" class="absolute bottom-4 left-4 right-4">
            <RoundButton icon={ArrowLeft} on:click={() => selectedFile = selectedFile <= -1 ? -1 : selectedFile - 1} />
            <RoundButton icon={ArrowRight} on:click={() => selectedFile = selectedFile >= (data.article.attached_files?.length ?? -1) ? (data.article.attached_files?.length ?? -1) : selectedFile + 1} />
        </Flex>
    </Wrapper>
</Flex>

<Flex direction="col" gap={6} class="mt-6">
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