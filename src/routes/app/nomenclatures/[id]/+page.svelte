<script lang="ts">
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/Table.svelte";
    import type { ActionData, PageData } from "./$types";

    import { Icon } from "@steeze-ui/svelte-icon";
    import { ExclamationTriangle, Wrench } from "@steeze-ui/heroicons";
    import FormInput from "$lib/components/FormInput.svelte";
    import PredictInput from "$lib/components/PredictInput.svelte";
    import type { ArticleRecord, ArticleResponse } from "$lib/DBTypes";

    export let data: PageData;
    export let form: ActionData;
    
    let editNomenclature = false;

    let selectedArticle: ArticleResponse | undefined = undefined;

    $: if(form?.success === true && browser) { invalidateAll(); }

</script>

{#if editNomenclature}
    <form action="?/editNomenclature" method="post">

        <Flex direction="col" class="w-1/3">
            <FormInput label="Nom de la nomenclature" labelMandatory={true} name="name" value={data.nomenclature.name}/>
            <FormInput label="Description" name="description" value={data.nomenclature.description}/>

            <Flex>
                <Button borderColor="ring-emerald-500" hoverColor="hover:bg-emerald-500">Valider</Button>
                <Button borderColor="ring-red-500" hoverColor="hover:bg-red-500" on:click={() => editNomenclature = false}>Annuler</Button>
            </Flex>
        </Flex>
    </form>
{:else}
    <h2>{data.nomenclature.name}</h2>
    <p>{data.nomenclature.description}</p>
    <button
        on:click={() => editNomenclature = true}
        class="my-2 text-violet-500 hover:text-blue-500 duration-200"
    >
        <Icon src={Wrench} class="h-5 w-5 inline"/>
        Editer les informations
    </button>
{/if}

<form action="?/addItem" method="post" class="mt-8">
    <Flex>

        <PredictInput articleArray={data.articles} bind:selectedArticle class="self-end"/>
        <input type="hidden" name="child_article" value={selectedArticle?.id} />

        <Input label="Quantité nécéssaire" name="quantity_required" labelMandatory={true}/>
        <Input label="Groupe" name="group" />

        <Button class="self-end">Ajouter!</Button>
    </Flex>
</form>

<Table>
    <svelte:fragment slot="head">
        <tr>
            <th>Éléments</th>
            <th>Groupe</th>
            <th>Quantité nécéssaire</th>
            <th>Supprimer</th>
        </tr>
    </svelte:fragment>

    <svelte:fragment slot="body">
        {#if data.nomenclature.expand?.['nomenclature_row(parent_nomenclature)'] !== undefined}
            {#each data.nomenclature.expand['nomenclature_row(parent_nomenclature)'] as row}
                <tr>    
                    <td><a href="/app/articles/{row.expand.child_article.id}" class="font-medium hover:text-violet-500">{row.expand.child_article.name}</a></td>
                    <td>{row.group}</td>
                    <td>{row.quantity_required}</td>
                    <td>
                        <form action="?/deleteItem" method="post">
                            <input type="hidden" id="row_id" value={row.id} name="row_id"/>
                            <Button>Supprimer</Button>
                        </form>
                    </td>
                </tr>
            {/each}
        {:else}
                <p class="p-6 font-medium text-lg">
                    <Icon src={ExclamationTriangle} theme="solid" class="h-10 w-10 mr-2 text-orange-500 inline"/>
                    Aucun élément présent dans la nomenclature.
                </p>
        {/if}
    </svelte:fragment>
</Table>


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