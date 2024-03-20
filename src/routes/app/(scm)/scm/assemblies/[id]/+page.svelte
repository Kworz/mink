<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto, invalidateAll } from "$app/navigation";
    import ArticleFinder from "$lib/components/derived/article/ArticleFinder.svelte";
    import ArticleRow from "$lib/components/derived/article/ArticleRow.svelte";
    import type { scm_articleWithIncludes } from "$lib/components/derived/article/article";
    import AssemblyPreview from "$lib/components/derived/assemblies/AssemblyPreview.svelte";
    import AssemblyTree from "$lib/components/derived/assemblies/AssemblyTree.svelte";
    import Button from "$lib/components/generics/Button.svelte";
    import DetailLabel from "$lib/components/generics/DetailLabel.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import Grid from "$lib/components/generics/layout/grid.svelte";
    import MenuSide from "$lib/components/generics/menu/MenuSide.svelte";
    import Modal from "$lib/components/generics/modal/Modal.svelte";
    import PillMenu from "$lib/components/generics/pill/pillMenu.svelte";
    import PillMenuButton from "$lib/components/generics/pill/pillMenuButton.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import TableFootCell from "$lib/components/generics/table/TableFootCell.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import type { scm_assembly_relation_article, scm_assembly_relation_sub_assembly } from "@prisma/client";
    import { ChevronDown, ChevronUp, DocumentChartBar, DocumentDuplicate, Trash, WrenchScrewdriver } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { ActionData, PageData } from "./$types";
    import { _ } from "svelte-i18n";
    import { page } from "$app/stores";
    import { browser } from "$app/environment";

    export let data: PageData;
    export let form: ActionData;

    let urlArticleFilter  = $page.url.searchParams.get("articleFilter");
    let articleFilter = urlArticleFilter !== null ? JSON.parse(decodeURIComponent(urlArticleFilter)) : {};

    let editAssembly = false;
    let deleteAssembly = false;
    let copyAssembly = false;
    let editAssemblyDeleteThumbnail = false;

    let moveRelationsToSubAssembly = false;

    let addArticleSelected: scm_articleWithIncludes | undefined = undefined;

    let deleteArticleRelation: scm_assembly_relation_article | undefined = undefined;
    let deleteSubAssemblyRelation: scm_assembly_relation_sub_assembly | undefined = undefined;

    let selectedArticles: string[] = [];
    let selectedAssemblies: string[] = [];

    const refresh = () => { if(browser) goto(`?articleFilter=${encodeURIComponent(JSON.stringify(articleFilter))}`); }

    $: selectedRelations = [...selectedArticles, ...selectedAssemblies];

    $: if(form !== null) { invalidateAll(); editAssembly = false; copyAssembly = false; editAssemblyDeleteThumbnail = false; };

    $: articleFilter, refresh();

</script>

<svelte:head>
    <title>{data.assembly.name} / {$_('app.generic.assembly')} - mink</title>
</svelte:head>

{#if editAssembly}
    <MenuSide on:close={() => editAssembly = false} title={$_('scm.assembly.action.edit.title')}>
        <form action="?/editAssembly" method="post" use:enhanceNoReset class="flex flex-col gap-4 mt-6" enctype="multipart/form-data">
            
            <FormInput type="text" name="name" label={$_('scm.assembly.name')} value={data.assembly.name} required />
            <FormInput type="text" name="description" label={$_('app.generic.description')} value={data.assembly.description} />
            <FormInput type="number" name="assembly_time" label={$_('scm.assembly.assembly_time')} min={0} step={0.25} value={data.assembly.assembly_time} />

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
                <Button role="warning" on:click={() => editAssembly = false}>{$_('app.generic.cancel')}</Button>
            </Flex>
        
        </form>
    </MenuSide>
{/if}

{#if deleteAssembly}
    <Modal on:close={() => deleteAssembly = false} title={$_('scm.assembly.action.delete.title', { values: { name: data.assembly.name }})}>
        <form action="?/deleteAssembly" method="post" use:enhance>
            <Button role="danger">{$_('app.generic.yes')}</Button>
            <Button role="tertiary" preventSend on:click={() => deleteAssembly = false}>{$_('app.generic.cancel')}</Button>
        </form>
    </Modal>
{/if}

{#if copyAssembly}
    <Modal on:close={() => copyAssembly = false} title={$_('scm.assembly.action.copy.title', { values: { name: data.assembly.name }})}>
        <form action="?/copyAssembly" method="post" use:enhance class="flex flex-col gap-4">
            <FormInput type="text" name="name" label={$_('app.generic.copy_name')} class="grow" />
            <Button role="primary" size="small">{$_('app.action.copy')}</Button>
        </form>
    </Modal>
{/if}

{#if deleteArticleRelation !== undefined || deleteSubAssemblyRelation !== undefined}
    <Modal on:close={() => {deleteArticleRelation = undefined; deleteSubAssemblyRelation = undefined}} title={$_('scm.assembly.action.delete_relation.title')}>

        <p>{$_('scm.assembly.action.delete_relation.body')}</p>

        <slot name="form">
            <form action="?/deleteRelation" method="post" use:enhance>
                <input type="hidden" name="subassembly_relation_id" value={deleteArticleRelation?.id} />
                <input type="hidden" name="article_relation_id" value={deleteSubAssemblyRelation?.id} />
                <Button role="danger" size="small">{$_('app.generic.yes')}</Button>
                <Button role="tertiary" size="small" preventSend on:click={() => {deleteArticleRelation = undefined; deleteSubAssemblyRelation = undefined}}>{$_('app.generic.cancel')}</Button>
            </form>
        </slot>
    </Modal>
{/if}

{#if moveRelationsToSubAssembly}
    <Modal on:close={() => moveRelationsToSubAssembly = false} title={$_('scm.assembly.action.move_relations.title', { values: { amount: selectedRelations.length }})}>

        <p>{$_('scm.assembly.action.move_relations.body')}</p>

        <form action="?/moveRelations" use:enhance method="post" class="flex flex-col gap-4 mt-2">
            <input type="hidden" name="selected_article_relations" value={selectedArticles.join(',')} />
            <input type="hidden" name="selected_assemblies_relations" value={selectedAssemblies.join(',')} />

            <FormInput name="name" type="text" label={$_('app.generic.sub_assembly')} required />
            <FormInput name="description" type="text" label={$_('app.generic.description')} />

            <Button role="primary">{$_('app.action.move')}</Button>
        </form>
    </Modal>
{/if}

<h1>{$_('app.generic.assembly')}: {data.assembly.name}</h1>
{#if data.assembly.description} <p>{data.assembly.description}</p> {/if}  
<p>{$_('scm.assembly.assembly_time')}: <DetailLabel>{data.assembly.assembly_time} {$_('app.time.hours')}</DetailLabel>.</p>

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
            <img src={data.assembly.thumbnail} alt={$_('scm.assembly.thumbnail', { values: { name: data.assembly.name }})} class="aspect-square w-48 mb-6 rounded-lg ring-1 ring-zinc-400/25"/>
        {/if}
        <AssemblyTree assembly={data.assemblyTree} />
    </section>

    <Grid cols={1} gap={6} items="center" class="w-full">
        <Table class="!mt-0" headers={["selectAll", { label: `${$_('app.generic.sub_assemblies')} (${data.assembly.assembly_childrens.length})`}, { label: $_('app.generic.quantity') }, { label: $_('app.action.delete') }]}>
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
                        <FormInput name="quantity" type="number" label={$_('app.generic.quantity')} bind:value={subAssemblyRelation.quantity} validateOnChange />
                    </form>
                </TableCell>
                <TableCell>
                    <Button size="small" role="danger" on:click={() => deleteSubAssemblyRelation = subAssemblyRelation}>{$_("app.action.delete")}</Button>
                </TableCell>
            {/each}

            {#if data.assemblies.length > 0}
                <TableFootCell class="col-span-4">
                    <h3>{$_('app.action.add_subassembly')}</h3>
                    <form action="?/addAssemblySubAssembly" method="post" use:enhance class="flex flex-row items-end gap-4 mt-2">
                        <FormInput name="child_assembly_id" label={$_('app.generic.sub_assembly')} required type="select">
                            {#each data.assemblies as assembly}
                                <option value={assembly.id}>{assembly.name}</option>
                            {/each}
                        </FormInput>
                        <FormInput name="quantity" label={$_('app.generic.quantity')} required type="number" min={1} />
                        <Button>{$_('app.action.add')}</Button>
                </TableFootCell>
            {/if}
        </Table>

        <Table class="!mt-0" headers={["selectAll", { label: `${$_('app.generic.articles')} (${data.assembly.article_childrens.length})`}, { label: $_('app.generic.quantity') }, { label: $_('app.action.delete')}]}>
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
                    <ArticleRow article={subArticleRelation.article_child} displayStock displayInboundSupplies />
                </TableCell>
                <TableCell>
                    <form action="?/updateAssemblyRelation" method="post" use:enhanceNoReset>
                        <input type="hidden" name="id" value={subArticleRelation.id} />
                        <FormInput name="quantity" type="number" bind:value={subArticleRelation.quantity} validateOnChange />
                    </form>
                </TableCell>
                <TableCell>
                    <Button size="small" role="danger" on:click={() => deleteArticleRelation = subArticleRelation}>{$_('app.action.delete')}</Button>
                </TableCell>
            {/each}

            {#if data.articles.length > 0}
                <TableFootCell class="col-span-4">
                    <h3>{$_('app.action.add_article')}</h3>
                    <form action="?/addAssemblySubArticle" method="post" use:enhance class="flex flex-row gap-8 items-end mt-2">
                        <ArticleFinder articles={data.articles.slice(-3)} bind:selectedArticle={addArticleSelected} bind:filter={articleFilter} formFieldName="child_article_id" />
                        {#if addArticleSelected !== undefined}
                            <FormInput name="quantity" label={$_('app.generic.quantity')} required type="number" />
                            <Button>{$_('app.action.add')}</Button>
                        {/if}
                    </form>
                </TableFootCell>
            {/if}
        </Table>
    </Grid> 
</Flex>