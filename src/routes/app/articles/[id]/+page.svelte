<script lang="ts">
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Grid from "$lib/components/layout/grid.svelte";
    import Table from "$lib/components/Table.svelte";
    import User from "$lib/components/user/User.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    $: if(form !== null && browser) { invalidateAll() }
</script>

<svelte:head>
    <title>Article — {data.article.name}</title>
</svelte:head>

<h2>{data.article.name}</h2>
<p>Editez l'article en utilisant le formulaire ci dessous</p>

<Grid cols={2} gap={8} class="my-6">

    <Wrapper>
        {#if form?.error} <p class="text-red-500">{form.error}</p> {/if}
        {#if form?.success} <p class="text-green-500">{form.success}</p> {/if}

        <form action="?/editArticle" method="post" use:enhanceNoReset>
            <Flex direction="col" gap={2}>
                <FormInput name="name" label="Nom de l'article" labelMandatory={true} bind:value={data.article.name} backgroundColor="bg-white"/>
                <FormInput name="quantity" type="number" label="Quantité en stock" labelMandatory={true} bind:value={data.article.quantity} backgroundColor="bg-white"/>
                <FormInput name="price" type="number" label="Prix" step={0.01} bind:value={data.article.price} backgroundColor="bg-white" />
                <FormInput name="reference" label="Référence" bind:value={data.article.reference} backgroundColor="bg-white" />
                <FormInput name="supplier" label="Fournisseur" bind:value={data.article.supplier} backgroundColor="bg-white"/>
                <FormInput name="manufacturer" label="Fabricant" bind:value={data.article.manufacturer} backgroundColor="bg-white"/>
                
                <Button class="self-start mt-4" borderColor="border-amber-500" hoverColor="hover:bg-amber-500">Modifier</Button>
            </Flex>
        </form>
    </Wrapper>

    <div>
        <Flex direction={"col"} gap={8}>
            <Wrapper>
                
                <h3>Ajouter a une nomenclature</h3>
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
    
            <Wrapper>
                <h3 class="leading-10">Zone de danger</h3>
                <Flex gap={4}>
                    <form action="?/deleteArticle" method="post" use:enhanceNoReset>
                        <Button borderColor="border-red-500" hoverColor="hover:bg-red-500">Supprimer l'article</Button>
                    </form>
                    
                    <form action="?/copyArticle" method="post" use:enhanceNoReset>
                        <Button borderColor="border-blue-500" hoverColor="hover:bg-blue-500">Copier l'article</Button>
                    </form>
                </Flex>
            </Wrapper>
        </Flex>
    </div>
</Grid>

{#if data.articleMovements.length > 0}
    <h3>Historique movement article</h3>
    <Table>
        <svelte:fragment slot="head">
            <tr>
                <th>Movement quantité</th>
                <th>Raison</th>
                <th>Utilisateur</th>
                <th>Date</th>
            </tr>
        </svelte:fragment>

        <svelte:fragment slot="body">
            {#each data.articleMovements as movement}
                <tr>    
                    <td>{movement.quantity_update}</td>
                    <td>{movement.created}</td>
                    <td>
                        {#if movement.expand?.user !== undefined}
                            <User user={movement.expand.user} />
                        {:else}
                            —
                        {/if}
                    </td>
                    <td>{movement.reason ?? "—"}</td>
                </tr>
            {/each}
        </svelte:fragment>
    </Table>
{/if}

<style>

    th {
        @apply p-4 border-b border-b-violet-500/75 text-left;
    }

    td {

        @apply p-4 border-b border-b-violet-500/25;
    }

    tr:last-child > td{
        @apply border-0;
    }
</style>