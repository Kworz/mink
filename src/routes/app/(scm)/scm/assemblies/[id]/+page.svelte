<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { ChevronDown, ChevronUp, DocumentChartBar, DocumentDuplicate, Trash, WrenchScrewdriver } from "@steeze-ui/heroicons";
    import MenuSide from "$lib/components/menu/MenuSide.svelte";
    import Modal from "$lib/components/modal/Modal.svelte";
    import AssemblyTree from "$lib/components/assemblies/AssemblyTree.svelte";
    import Button from "$lib/components/Button.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    
    import type { ActionData, PageData } from "./$types";
    import Grid from "$lib/components/layout/grid.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import { Icon } from "@steeze-ui/svelte-icon";
    import ArticleFinder from "$lib/components/article/ArticleFinder.svelte";
    import TableFootCell from "$lib/components/table/TableFootCell.svelte";
    import ArticleRow from "$lib/components/article/ArticleRow.svelte";
    import type { SCMArticleWithIncludes } from "$lib/components/article/article";
    import type { SCMAssemblyRelationArticle, SCMAssemblyRelationSubAssembly } from "@prisma/client";
    import AssemblyPreview from "$lib/components/assemblies/AssemblyPreview.svelte";

    export let data: PageData;
    export let form: ActionData;

    let editAssembly = false;
    let deleteAssembly = false;
    let copyAssembly = false;
    let editAssemblyDeleteThumbnail = false;

    let moveRelationsToSubAssembly = false;

    let addArticleSelected: SCMArticleWithIncludes | undefined = undefined;

    let deleteArticleRelation: SCMAssemblyRelationArticle | undefined = undefined;
    let deleteSubAssemblyRelation: SCMAssemblyRelationSubAssembly | undefined = undefined;

    let selectedArticles: string[] = [];
    let selectedAssemblies: string[] = [];

    $: selectedRelations = [...selectedArticles, ...selectedAssemblies];

    $: if(form !== null) { invalidateAll(); editAssembly = false; copyAssembly = false; editAssemblyDeleteThumbnail = false; };

</script>

<svelte:head>
    <title>{data.assembly.name} - Assemblages</title>
</svelte:head>

{#if editAssembly}
    <MenuSide on:close={() => editAssembly = false}>
        <form action="?/editAssembly" method="post" use:enhanceNoReset class="flex flex-col gap-4 mt-6">
            
            <FormInput type="text" name="name" label="Nom de l'assemblage" value={data.assembly.name} labelMandatory />
            <FormInput type="text" name="description" label="Description" value={data.assembly.description} />
            <FormInput type="number" name="assembly_time" label="Durée de montage (heures)" min={0} step={0.25} value={data.assembly.assembly_time} />

            {#if data.assembly.thumbnail !== null}
                <Button on:click={() => editAssemblyDeleteThumbnail = !editAssemblyDeleteThumbnail} preventSend  size="small" role={editAssemblyDeleteThumbnail ? "warning" : "danger"} class="self-start">{editAssemblyDeleteThumbnail ? "Anuller le retrait" : "Retirer la miniature"}</Button>
                {#if editAssemblyDeleteThumbnail}
                    <input type="hidden" value="" name="deleteThumbnail" />
                {/if}
            {:else}
                <FormInput type="file" name="thumbnail" label="Miniature" />
            {/if}

            <Flex>
                <Button>Valider les modifications</Button>
                <Button role="warning" on:click={() => editAssembly = false}>Anuller</Button>
            </Flex>
        
        </form>
    </MenuSide>
{/if}

{#if deleteAssembly}
    <Modal on:close={() => deleteAssembly = false} title="Souhaitez vous supprimer {data.assembly.name}">
        <form action="?/deleteAssembly" method="post" use:enhance>
            <Button role="danger">Oui</Button>
            <Button role="tertiary" preventSend on:click={() => deleteAssembly = false}>Non</Button>
        </form>
    </Modal>
{/if}

{#if copyAssembly}
    <Modal on:close={() => copyAssembly = false} title="Copie de {data.assembly.name}">
        <form action="?/copyAssembly" method="post" use:enhance class="flex flex-col gap-4">
            <FormInput type="text" name="name" label="Nom de la copie" class="grow" />
            <Button role="primary" size="small">Copier</Button>
        </form>
    </Modal>
{/if}

{#if deleteArticleRelation !== undefined || deleteSubAssemblyRelation !== undefined}
    <Modal on:close={() => {deleteArticleRelation = undefined; deleteSubAssemblyRelation = undefined}} title={"Confirmer la supréssion"}>

        <p>Souhaitez vous supprimer la relation ?</p>

        <slot name="form">
            <form action="?/deleteRelation" method="post" use:enhance>
                <input type="hidden" name="subassembly_relation_id" value={deleteArticleRelation?.id} />
                <input type="hidden" name="article_relation_id" value={deleteSubAssemblyRelation?.id} />
                <Button role="danger" size="small">Oui</Button>
                <Button role="tertiary" size="small" preventSend on:click={() => {deleteArticleRelation = undefined; deleteSubAssemblyRelation = undefined}}>Non</Button>
            </form>
        </slot>
    </Modal>
{/if}

{#if moveRelationsToSubAssembly}
    <Modal on:close={() => moveRelationsToSubAssembly = false} title="Déplacer {selectedRelations.length} relations vers un sous assemblage">

        <p>Choisissez un nom pour le nouveau sous-assemblage cible</p>

        <form action="?/moveRelations" use:enhance method="post" class="flex flex-col gap-4 mt-2">
            <input type="hidden" name="selected_article_relations" value={selectedArticles.join(',')} />
            <input type="hidden" name="selected_assemblies_relations" value={selectedAssemblies.join(',')} />

            <FormInput name="name" type="text" label="Nom du sous-assemblage" labelMandatory />
            <FormInput name="description" type="text" label="Description" />

            <Button role="primary">Déplacer</Button>
        </form>
    </Modal>
{/if}

<h1>Assemblage: {data.assembly.name}</h1>
{#if data.assembly.description} <p>{data.assembly.description}</p> {/if}  
<p>Durée d'assemblage: <DetailLabel>{data.assembly.assembly_time} Heures</DetailLabel>.</p>

<PillMenu message={(selectedRelations.length > 0) ? `${selectedRelations.length} Éléments selectionnés` : undefined}>
    <PillMenuButton icon={WrenchScrewdriver} click={() => editAssembly = !editAssembly}>Modifier l'assemblage</PillMenuButton>
    <PillMenuButton icon={DocumentDuplicate} click={() => copyAssembly = true}>Copier l'assemblage</PillMenuButton>
    <PillMenuButton icon={Trash} click={() => deleteAssembly = true}>Supprimer l'assemblage"</PillMenuButton>
    {#if selectedRelations.length > 0}
        <PillMenuButton icon={DocumentChartBar} click={() => moveRelationsToSubAssembly = true}>Déplacer les éléments vers un sous-assemblage</PillMenuButton>
    {/if}
</PillMenu>

<Flex class="mt-6" gap={6}>

    <section class="shrink-0">
        {#if data.assembly.thumbnail !== null}
            <img src={data.assembly.thumbnail} alt="Miniature de l'assemblage {data.assembly.name}" class="aspect-square w-48 mb-6 rounded-lg ring-1 ring-zinc-400/25"/>
        {/if}
        <AssemblyTree assembly={data.assemblyTree} />
    </section>

    <Grid cols={1} gap={6} items="center" class="w-full">
        <Table headers={["selectAll", { label: `Sous assemblage (${data.assembly.assembly_childrens.length})`}, { label: "Quantité" }, { label: "Supprimer" }]}>
            {#each data.assembly.assembly_childrens as subAssemblyRelation, index}
                <TableCell class="items-center">                
                    <form action="?/updateAssemblyRelationOrder" method="post" use:enhance class="flex flex-col gap-2">
                        <input type="hidden" name="id" value={subAssemblyRelation.id} />
                        <input type="hidden" name="order" value={subAssemblyRelation.order} />
                        {#if index !== 0}
                            <button name="direction" value="up" class="text-gray-500 hover:text-violet-500 duration-100">
                                <Icon src={ChevronUp} class="h-6 w-6" />
                            </button>
                        {/if}

                        <input type="checkbox" bind:group={selectedAssemblies} value={subAssemblyRelation.id} />

                        {#if index !== data.assembly.assembly_childrens.length - 1}
                            <button name="direction" value="down" class="text-gray-500 hover:text-violet-500 duration-100">
                                <Icon src={ChevronDown} class="h-6 w-6" />
                            </button>
                        {/if} 
                    </form>
                </TableCell>
                <TableCell>
                    <AssemblyPreview assembly={subAssemblyRelation.assembly_child} />
                </TableCell>
                <TableCell>
                    <form action="?/updateAssemblyRelationSubassembly" method="post" use:enhanceNoReset>
                        <input type="hidden" name="id" value={subAssemblyRelation.id} />
                        <FormInput name="quantity" type="number" bind:value={subAssemblyRelation.quantity} validateOnChange />
                    </form>
                </TableCell>
                <TableCell>
                    <Button size="small" role="danger" on:click={() => deleteSubAssemblyRelation = subAssemblyRelation}>Supprimer</Button>
                </TableCell>
            {/each}

            {#if data.assemblies.length > 0}
                <TableFootCell class="col-span-4">
                    <h3>Ajouter un sous-assemblage</h3>
                    <form action="?/addAssemblySubAssembly" method="post" use:enhance class="flex flex-row items-end gap-4 mt-2">
                        <FormInput name="child_assembly_id" label="Sous assemblage" labelMandatory type="select">
                            {#each data.assemblies as assembly}
                                <option value={assembly.id}>{assembly.name}</option>
                            {/each}
                        </FormInput>
                        <FormInput name="quantity" label="Quantité" labelMandatory type="number" min={1} />
                        <Button>Ajouter</Button>
                </TableFootCell>
            {/if}
        </Table>

        <Table headers={["selectAll", { label: `Article (${data.assembly.article_childrens.length})`}, { label: "Quantité" }, { label: "Supprimer" }]}>
            {#each data.assembly.article_childrens as subArticleRelation, index (subArticleRelation.id)}
                <TableCell class="items-center">
                    <form action="?/updateAssemblyRelationOrder" method="post" use:enhance class="flex flex-col gap-2">
                        <input type="hidden" name="id" value={subArticleRelation.id} />
                        <input type="hidden" name="order" value={subArticleRelation.order} />
                        {#if index !== 0}
                            <button name="direction" value="up" class="text-gray-500 hover:text-violet-500 duration-100">
                                <Icon src={ChevronUp} class="h-6 w-6" />
                            </button>
                        {/if}

                        <input type="checkbox" bind:group={selectedArticles} value={subArticleRelation.id} />

                        {#if index !== data.assembly.article_childrens.length - 1}
                            <button name="direction" value="down" class="text-gray-500 hover:text-violet-500 duration-100">
                                <Icon src={ChevronDown} class="h-6 w-6" />
                            </button>
                        {/if} 
                    </form>
                </TableCell>
                <TableCell>
                    <ArticleRow article={subArticleRelation.article_child} displayStock displayApprox />
                </TableCell>
                <TableCell>
                    <form action="?/updateAssemblyRelation" method="post" use:enhanceNoReset>
                        <input type="hidden" name="id" value={subArticleRelation.id} />
                        <FormInput name="quantity" type="number" bind:value={subArticleRelation.quantity} validateOnChange />
                    </form>
                </TableCell>
                <TableCell>
                    <Button size="small" role="danger" on:click={() => deleteArticleRelation = subArticleRelation}>Supprimer</Button>
                </TableCell>
            {/each}

            {#if data.articles.length > 0}
                <TableFootCell class="col-span-4">
                    <h3>Ajouter un article</h3>
                    <form action="?/addAssemblySubArticle" method="post" use:enhance class="flex flex-row gap-8 items-end mt-2">
                        <ArticleFinder articles={data.articles} bind:selectedArticle={addArticleSelected} formFieldName="child_article_id" />
                        {#if addArticleSelected !== undefined}
                            <FormInput name="quantity" label="Quantité" labelMandatory={true} type="number" />
                            <Button>Ajouter</Button>
                        {/if}
                    </form>
                </TableFootCell>
            {/if}
        </Table>
    </Grid> 
</Flex>