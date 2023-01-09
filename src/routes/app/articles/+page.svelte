<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/Input.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Table from "$lib/components/Table.svelte";
    import type { Record } from "pocketbase";

    import type { PageData } from "./$types";
    export let data: PageData;

    let filter = "";

    const filterFn = (k: Record, filterString: string): boolean => {

        if(filterString.startsWith("reference:"))
        {
            const referenceToFind = filterString.replace("reference:", "");
            return k.reference.includes(referenceToFind);
        }

        if(filterString.startsWith("supplier:"))
        {
            const supplierToFind = filterString.replace("supplier:", "");
            return k.supplier.includes(supplierToFind);
        }

        return k.name.includes(filterString);
    };

</script>

<h2>Articles</h2>
<p>Liste des articles disponible dans la base.</p>

<Flex class="mt-8">
    <a href="/app/articles/new"><Button>Ajouter un article</Button></a>
    <a href="/app/articles/import"><Button>Importer des articles</Button></a>
    <Input bind:value={filter} placeholder="Filtre" />
</Flex>

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
        {#each data.articles.filter((k) => filterFn(k, filter)) as article (article.id)}
            <tr>
                <td><a href="/app/articles/{article.id}" class="font-medium hover:text-violet-500 duration-100">{article.name}</a></td>
                <td>{article.quantity}</td>
                <td>{article.reference}</td>
                <td>{article.supplier}</td>
                <td>{article.manufacturer}</td>
                <td>{article.price ?? "—"} €</td>
            </tr>
        {/each}
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