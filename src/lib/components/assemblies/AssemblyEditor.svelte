<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/stores";
    import { Collections, type AssembliesRelationsRecord } from "$lib/DBTypes";
    import { onMount } from "svelte";
    import type { ArticleResponseExpanded } from "$lib/components/article/ArticleRow.svelte";
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

    import AssemblyPreview from "./AssemblyPreview.svelte";
    import type { AssembliesRelationsReponseExpanded } from "./AssemblyTree.svelte";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { ChevronDown, ChevronUp } from "@steeze-ui/heroicons";
    import { afterNavigate } from "$app/navigation";

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

        if($page.params.id === undefined)
            return;

        if(addArticleSelected === undefined)
            return;
        
        if(addArticleQuantity <= 0)
            return;

        const relation = {

            parent: $page.params.id,
            article_child: addArticleSelected.id,
            quantity: addArticleQuantity,
            order: (subArticlesRelations.at(-1)?.order ?? 0) -1

        } satisfies AssembliesRelationsRecord;

        await $page.data.pb.collection(Collections.AssembliesRelations).create(relation);

        addArticleSelected = undefined;
        addArticleQuantity = 1;

        await refreshData();

    }

    const addSubAssembly = async () => {

        if($page.params.id === undefined)
            return;
        
        if(addSubAssemblySelected === undefined)
            return;
        
        if(addSubAssemblyQuantity < 1)
            return;
        
        const relation = {
            parent: $page.params.id,
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
            parent: $page.params.id,
            assembly_child: new_asm.id,
            quantity: 1
        });

        selectedArticles = [];

        await refreshData();
    }

    const changeRelationOrder = async (relation: string, index: number, direction: "up" | "down", cat: "assembly" | "article" = "article") => {

        if(direction === "up" && index === 0)
            return;

        if(direction === "down" && (index === subArticlesRelations.length - 1 || index === subAssembliesRelations.length - 1))
            return;
            
        const relativeIndex = direction === "up" ? index - 1 : index + 1;
        const newOrder = (cat === "article") ? subArticlesRelations[relativeIndex].order : subAssembliesRelations[relativeIndex].order;
        const oldOrder = (cat === "article") ? subArticlesRelations[index].order : subAssembliesRelations[index].order;
            
        const swappedRelation = (cat === "article") ? subArticlesRelations[relativeIndex].id : subAssembliesRelations[relativeIndex].id;

        await $page.data.pb?.collection(Collections.AssembliesRelations).update(swappedRelation, { order: oldOrder } satisfies Partial<AssembliesRelationsRecord>);
        await $page.data.pb?.collection(Collections.AssembliesRelations).update(relation, { order: newOrder } satisfies Partial<AssembliesRelationsRecord>);

        await refreshData();
    }

    const refreshDataPageLoad = async () => {
        if(browser)
            await refreshData();

        if(subArticlesRelations.filter(r => r.order === 0).length === subArticlesRelations.length)
        {
            for(const [index, subArticleRelation] of subArticlesRelations.entries())
            {
                await $page.data.pb?.collection(Collections.AssembliesRelations).update(subArticleRelation.id, { order: index + 1 } satisfies Partial<AssembliesRelationsRecord>);
            }
            await refreshData();
        }

        if(subAssembliesRelations.filter(r => r.order === 0).length === subAssembliesRelations.length)
        {
            for(const [index, subAssembliesRelation] of subAssembliesRelations.entries())
            {
                await $page.data.pb?.collection(Collections.AssembliesRelations).update(subAssembliesRelation.id, { order: index + 1 } satisfies Partial<AssembliesRelationsRecord>);
            }
            await refreshData();
        }
    }

    let selectedArticles: string[] = [];
    let selectedAssemblies: string[] = [];

    onMount(async () => {
        await refreshDataPageLoad();
    });

    afterNavigate(async () => {
        await refreshDataPageLoad();
    });

    const refreshData = async () => relations = await $page.data.pb.collection(Collections.AssembliesRelations).getFullList<AssembliesRelationsReponseExpanded>({ filter: `parent = "${$page.params.id}"`, expand: `assembly_child,article_child.supplier`, sort: "-order" }) ?? [];

    $: subAssembliesRelations = relations.filter(r => r.assembly_child !== undefined && r.expand?.assembly_child !== undefined);
    $: subArticlesRelations = relations.filter(r => r.article_child !== undefined && r.expand?.article_child !== undefined);

    $: $page.params.id, refreshDataPageLoad();

</script>

{#if $page.params.id !== undefined}
    <Grid cols={1} gap={6} items="center" class="w-full">

        {#if subAssembliesRelations.length > 0}
            <Table marginTop="">
                <svelte:fragment slot="head">
                    <TableHead></TableHead>
                    <TableHead>Sous assemblage ({subAssembliesRelations.length})</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Supprimer</TableHead>
                </svelte:fragment>
                <svelte:fragment slot="body">
                    {#each subAssembliesRelations as subAssemblyRelation, index}
                        <TableRow>
                            <TableCell>                
                                <Flex items="center" direction="col" gap={2}>
                                    {#if index !== 0}
                                        <button class="text-gray-500 hover:text-violet-500 duration-100" on:click={() => {
                                            changeRelationOrder(subAssemblyRelation.id, index, "up", "assembly");
                                        }}>
                                            <Icon src={ChevronUp} class="h-6 w-6" />
                                        </button>
                                    {/if}

                                    <span>{subAssemblyRelation.order}</span>

                                    <input type="checkbox" bind:group={selectedAssemblies} value={subAssemblyRelation.id} />

                                    {#if index !== subArticlesRelations.length - 1}
                                        <button class="text-gray-500 hover:text-violet-500 duration-100" on:click={() => {
                                            changeRelationOrder(subAssemblyRelation.id, index, "down", "assembly")
                                        }}>
                                            <Icon src={ChevronDown} class="h-6 w-6" />
                                        </button>
                                    {/if}
                                </Flex>
                            </TableCell>
                            <TableCell>
                                <AssemblyPreview assembly={subAssemblyRelation.expand?.assembly_child} />
                            </TableCell>
                            <TableCell>
                                <Flex items="center">
                                    <FormInput name="" type="number" bind:value={subAssemblyRelation.quantity} blur={() => updateRelation(subAssemblyRelation.id)}/>
                                </Flex>
                            </TableCell>
                            <TableCell>
                                <Button size="small" role="danger" on:click={() => deleteRelation(subAssemblyRelation.id)}>{confirmDelete === subAssemblyRelation.id ? "Confirmer!" : "Supprimer"}</Button>
                            </TableCell>
                        </TableRow>
                    {/each}
                </svelte:fragment>
            </Table>
        {/if}

        {#if subArticlesRelations.length > 0}

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
                        <TableHead>Article ({subArticlesRelations.length})</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Supprimer</TableHead>
                    </svelte:fragment>
                    <svelte:fragment slot="body">
                        {#each subArticlesRelations as subArticleRelation, index (subArticleRelation.id)}
                            <TableRow>
                                <TableCell>
                                    <Flex items="center" direction="col" gap={2}>
                                        {#if index !== 0}
                                            <button class="text-gray-500 hover:text-violet-500 duration-100" on:click={() => {
                                                changeRelationOrder(subArticleRelation.id, index, "up");
                                            }}>
                                                <Icon src={ChevronUp} class="h-6 w-6" />
                                            </button>
                                        {/if}

                                        <span>{subArticleRelation.order}</span>

                                        <input type="checkbox" bind:group={selectedArticles} value={subArticleRelation.id} />

                                        {#if index !== subArticlesRelations.length - 1}
                                            <button class="text-gray-500 hover:text-violet-500 duration-100" on:click={() => {
                                                changeRelationOrder(subArticleRelation.id, index, "down")
                                            }}>
                                                <Icon src={ChevronDown} class="h-6 w-6" />
                                            </button>
                                        {/if}
                                    </Flex>
                                </TableCell>
                                <TableCell>
                                    <ArticleRow article={subArticleRelation.expand?.article_child} displayStock displayApprox />
                                </TableCell>
                                <TableCell>
                                    <Flex items="center">
                                        <FormInput name="" type="number" bind:value={subArticleRelation.quantity} />
                                        <Button size="small" on:click={() => updateRelation(subArticleRelation.id)}>Mettre à jour</Button>
                                    </Flex>
                                </TableCell>
                                <TableCell>
                                    <Button size="small" role="danger" on:click={() => deleteRelation(subArticleRelation.id)}>{confirmDelete === subArticleRelation.id ? "Confirmer!" : "Supprimer"}</Button>
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
                    <ArticleFinder bind:selectedArticle={addArticleSelected} filters={subArticlesRelations.map(a => { return { field: "id", operator: "!=", value: a.article_child, hidden: true}})} />
                    {#if addArticleSelected}
                        <FormInput name="quantity" label="Quantité" labelMandatory={true} type="number" bind:value={addArticleQuantity} />
                        <Button on:click={addArticle}>Ajouter</Button>
                    {/if}
                </Flex>
            </Wrapper>
        
        </Grid>
    
    </Grid> 
{/if}
