<script lang="ts">
    import { browser } from "$app/environment";
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Grid from "$lib/components/layout/grid.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import type { ActionData, PageData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    $: if(form !== null && browser) { invalidateAll() }

</script>

<h2>{data.article.name}</h2>
<p>Editez l'article en utilisant le formulaire ci dessous</p>

<Grid cols={2} gap={8} class="mt-6">

    <Wrapper>
        {#if form?.error} <p class="text-red-500">{form.error}</p> {/if}
        {#if form?.success} <p class="text-green-500">{form.success}</p> {/if}

        <form action="?/editArticle" method="post" use:enhance>
            <Flex direction="col" gap={2}>
                <FormInput name="name" label="Nom de l'article" labelMandatory={true} bind:value={data.article.name} backgroundColor="bg-white"/>
                <FormInput name="quantity" type="number" label="Quantité en stock" labelMandatory={true} bind:value={data.article.quantity} backgroundColor="bg-white"/>
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
                <form action="?/addToNomenclature" method="post" use:enhance>
                    <Flex items="end">
                
                        <FormInput name="parent_nomenclature" type="select" label="nomenclature" labelMandatory={true} backgroundColor="white">
                            {#each data.nomenclatures as nomenclature}
                                <option value={nomenclature.id}>{nomenclature.name}</option>
                            {/each}
                        </FormInput>
                
                        <FormInput name="item_quantity" type="number" label="Quantité requise" labelMandatory={true} value={0} backgroundColor="white"/>
                        <Button>Ajouter</Button>
                    </Flex>
                </form>
            </Wrapper>
    
            <Wrapper>
                <h3 class="leading-10">Zone de danger</h3>
                <Flex gap={4}>
                    <form action="?/deleteArticle" method="post" use:enhance>
                        <Button borderColor="border-red-500" hoverColor="hover:bg-red-500">Supprimer l'article</Button>
                    </form>
                    
                    <form action="?/copyArticle" method="post" use:enhance>
                        <Button borderColor="border-blue-500" hoverColor="hover:bg-blue-500">Copier l'article</Button>
                    </form>
                </Flex>
            </Wrapper>
        </Flex>
    </div>
</Grid>


