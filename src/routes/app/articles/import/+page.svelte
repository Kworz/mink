<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/Table.svelte";

    let file: File | undefined = undefined;

    let fileGoodContent = false;

</script>

<h2>Importer des articles</h2>
<p>Importer des articles a l'aide d'un fichier.</p>

<form action="?/import" method="post" class="mt-8" enctype='multipart/form-data'>
    <Flex direction="col" class="w-1/3">

        <FormInput type="file" name="file" labelMandatory={true} on:change={(e)=> {
            console.log(e);
            file = e.target.files.item(0);
        }}/>

        {#if file !== undefined}
            <Button class="self-start">Importer</Button>
        {/if}

    </Flex>

</form>

{#if file !== undefined}    
    {#await file.text()}
        <p>Loading JSON file</p>
    {:then textContent} 
        {@const json = JSON.parse(textContent)}   

        <Table>
            <svelte:fragment slot="head">
                <tr>
                    <th>Article</th>
                    <th>Quantité disponible</th>
                    <th>Référence</th>
                    <th>Fournisseur</th>
                    <th>Fabricant</th>
                    <th>Prix</th>
                </tr>
            </svelte:fragment>
        
            <svelte:fragment slot="body">
                {#each json as article}
                    <tr>
                        <td>{article.name}</td>
                        <td>{article.quantity}</td>
                        <td>{article.reference}</td>
                        <td>{article.supplier}</td>
                        <td>{article.manufacturer}</td>
                        <td>{article.price}</td>
                    </tr>
                {/each}
            </svelte:fragment>
        </Table>
    {/await}
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