<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/stores";
    import { Collections, type AssembliesRelationsRecord } from "$lib/DBTypes";
    import { onMount } from "svelte";
    import type { ArticleResponseExpanded } from "../../../routes/app/articles/+page.server";
    import ArticleFinder from "../article/ArticleFinder.svelte";
    import ArticleRow from "../article/ArticleRow.svelte";
    import Button from "../Button.svelte";
    import FormInput from "../FormInput.svelte";
    import Flex from "../layout/flex.svelte";

    import Grid from "../layout/grid.svelte";
    import Table from "../table/Table.svelte";
    import TableCell from "../table/TableCell.svelte";
    import TableHead from "../table/TableHead.svelte";
    import TableRow from "../table/TableRow.svelte";
    import Wrapper from "../Wrapper.svelte";

    import { getAssemblyContext } from "./assemblyContext";
    import AssemblyPreview from "./AssemblyPreview.svelte";
    import type { AssembliesRelationsReponseExpanded } from "./AssemblyTree.svelte";
    const { selectedAssembly } = getAssemblyContext();

    let relations : AssembliesRelationsReponseExpanded[] = [];

    let addArticleSelected: ArticleResponseExpanded | undefined = undefined;
    let addArticleQuantity: number = 1;

    let addSubAssemblySelected: string | undefined = undefined;
    let addSubAssemblyQuantity: number = 1;

    let confirmBatchDelete = false;

    let createNewSubAssembly = false;
    let newSubAssemblyName = "";
    let newSubAssemblyDesc = "";

    const addArticle = async () => {

        if($selectedAssembly === undefined)
            return;

        if(addArticleSelected === undefined)
            return;
        
        if(addArticleQuantity <= 0)
            return;

        const relation = {

            parent: $selectedAssembly.id,
            article_child: addArticleSelected.id,
            quantity: addArticleQuantity

        } satisfies AssembliesRelationsRecord;

        await $page.data.pb.collection(Collections.AssembliesRelations).create(relation);

        addArticleSelected = undefined;
        addArticleQuantity = 1;

        await refreshData();

    }

    const addSubAssembly = async () => {

        if($selectedAssembly === undefined)
            return;
        
        if(addSubAssemblySelected === undefined)
            return;
        
        if(addSubAssemblyQuantity < 1)
            return;
        
        const relation = {
            parent: $selectedAssembly.id,
            assembly_child: addSubAssemblySelected,
            quantity: addSubAssemblyQuantity
        } satisfies AssembliesRelationsRecord;

        await $page.data.pb?.collection(Collections.AssembliesRelations).create(relation);

        addSubAssemblyQuantity = 1;
        addSubAssemblySelected = undefined;

        await refreshData();
        
    }

    let confirmDelete: string | undefined = undefined;

    const deleteRelation = async (relation: string, force = false) => {

        if(confirmDelete === relation || force)
        {
            await $page.data.pb?.collection(Collections.AssembliesRelations).delete(relation);
            await refreshData();
        }
        else
        {
            confirmDelete = relation;
        }
    }

    const updateRelation = async (relation: string) => {
        const relationObj = relations.find(r => r.id === relation);

        if(relationObj === undefined)
            return;

        await $page.data.pb?.collection(Collections.AssembliesRelations).update(relation, { quantity: relationObj.quantity });

        await refreshData();
    }

    const createNewSubAssemblyFn = async (relations: string[]) => {

        const new_asm = await $page.data.pb?.collection(Collections.Assemblies).create({
            name: newSubAssemblyName,
            description: newSubAssemblyDesc
        });

        if(new_asm === undefined)
            return;

        for(const relation of relations)
        {
            await $page.data.pb?.collection(Collections.AssembliesRelations).update(relation, { parent: new_asm.id } satisfies Partial<AssembliesRelationsRecord>);
        }

        await $page.data.pb?.collection(Collections.AssembliesRelations).create({
            parent: $selectedAssembly?.id,
            assembly_child: new_asm.id,
            quantity: 1
        });

        selectedArticles = [];

        await refreshData();
    }

    let selectedArticles: Array<string> = [];

    onMount(async () => {
        if(browser)
            await refreshData();
    });

    const refreshData = async () => relations = await $page.data.pb.collection(Collections.AssembliesRelations).getFullList<AssembliesRelationsReponseExpanded>({ filter: `parent="${$selectedAssembly.id}"`, expand: 'assembly_child,article_child.supplier' }) ?? [];

    $: subAssemblies = relations.filter(r => r.assembly_child !== undefined && r.expand?.assembly_child !== undefined);
    $: subArticles = relations.filter(r => r.article_child !== undefined && r.expand?.article_child !== undefined);

    $: $selectedAssembly, refreshData();

</script>

{#if $selectedAssembly !== undefined}
    <Grid cols={1} gap={6} items="center" class="w-full">

        {#if subAssemblies.length > 0}
            <Table marginTop="">
                <svelte:fragment slot="head">
                    <TableHead>Sous assemblage ({subAssemblies.length})</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Supprimer</TableHead>
                </svelte:fragment>
                <svelte:fragment slot="body">
                    {#each subAssemblies as subAssembly}
                        <TableRow>
                            <TableCell>
                                <AssemblyPreview assembly={subAssembly.expand.assembly_child} />
                            </TableCell>
                            <TableCell>
                                <Flex items="center">
                                    <FormInput name="" type="number" bind:value={subAssembly.quantity} />
                                    <Button size="small" on:click={() => updateRelation(subAssembly.id)}>Mettre à jour</Button>
                                </Flex>
                            </TableCell>
                            <TableCell>
                                <Button size="small" role="danger" on:click={() => deleteRelation(subAssembly.id)}>{confirmDelete === subAssembly.id ? "Confirmer!" : "Supprimer"}</Button>
                            </TableCell>
                        </TableRow>
                    {/each}
                </svelte:fragment>
            </Table>
        {/if}

        {#if subArticles.length > 0}

            <Wrapper>
                {#if selectedArticles.length > 0}
                    <Flex>
                        <Button role="danger" size="small" on:click={() => {
                            if(confirmBatchDelete)
                            {
                                selectedArticles.forEach(async (article) => await deleteRelation(article, true))
                                confirmBatchDelete = false;
                                selectedArticles = [];
                            }
                            else
                            {
                                confirmBatchDelete = true;
                            }
                        }}>{confirmBatchDelete ? "Confirmer !" : "Supprimer les articles sélectionnés"}</Button>


                        {#if createNewSubAssembly}
                            <FormInput name="asm_name" label="Nom du nouvel assemblage" labelMandatory bind:value={newSubAssemblyName} />
                            <FormInput name="asm_desc" label="Description du nouvel assemblage" bind:value={newSubAssemblyDesc} />
                        {/if}

                        <Button size="small" role="secondary" on:click={() => {
                            if(createNewSubAssembly)
                            {
                                createNewSubAssemblyFn(selectedArticles);
                                createNewSubAssembly = false;
                            }
                            else
                            {
                                createNewSubAssembly = true;
                            }
                        }}>Former un nouveau sous assemblage</Button>
                    </Flex>
                {/if}

                <Table embeded marginTop="">
                    <svelte:fragment slot="head">
                        <TableHead></TableHead>
                        <TableHead>Article ({subArticles.length})</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Supprimer</TableHead>
                    </svelte:fragment>
                    <svelte:fragment slot="body">
                        {#each subArticles as subArticle}
                            <TableRow>
                                <TableCell>
                                    <input type="checkbox" bind:group={selectedArticles} value={subArticle.id} />
                                </TableCell>
                                <TableCell>
                                    <ArticleRow article={subArticle.expand?.article_child} displayStock displayApprox />
                                </TableCell>
                                <TableCell>
                                    <Flex items="center">
                                        <FormInput name="" type="number" bind:value={subArticle.quantity} />
                                        <Button size="small" on:click={() => updateRelation(subArticle.id)}>Mettre à jour</Button>
                                    </Flex>
                                </TableCell>
                                <TableCell>
                                    <Button size="small" role="danger" on:click={() => deleteRelation(subArticle.id)}>{confirmDelete === subArticle.id ? "Confirmer!" : "Supprimer"}</Button>
                                </TableCell>
                            </TableRow>
                        {/each}
                    </svelte:fragment>
                </Table>
            </Wrapper>

            
        {/if}

        <Grid cols={2} gap={6} items="start">
        
            <Wrapper>
                <Flex direction="col" items="start">
                    <h4>Ajouter un sous assemblage</h4>
                    <FormInput name="ss_asm" label="Sous assemblage" labelMandatory={true} type="select" bind:value={addSubAssemblySelected}>
                        {#await $page.data.pb.collection(Collections.Assemblies).getFullList()}
                            <option disabled>Chargement</option>
                        {:then assemblies} 
                            {#each assemblies as assembly}
                                <option value={assembly.id}>{assembly.name}</option>
                            {/each}
                        {/await}
                    </FormInput>
                    <FormInput name="qty" label="Quantité" labelMandatory={true} type="number" min={1} bind:value={addSubAssemblyQuantity} />
                    <Button on:click={addSubAssembly}>Ajouter</Button>
                </Flex>
            </Wrapper>

            <Wrapper>
                <h4 class="mb-4">Ajouter un article</h4>

                <Flex direction="col" items="start">
                    <ArticleFinder bind:selectedArticle={addArticleSelected} filters={subArticles.map(a => { return { field: "id", operator: "!=", value: a.article_child, hidden: true}})} />
                    {#if addArticleSelected}
                        <FormInput name="quantity" label="Quantité" labelMandatory={true} type="number" bind:value={addArticleQuantity} />
                        <Button on:click={addArticle}>Ajouter</Button>
                    {/if}
                </Flex>
            </Wrapper>
        
        </Grid>
    
    </Grid> 
{/if}
