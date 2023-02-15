<script lang="ts">
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import type { ActionData, PageData } from "./$types";
    export let data: PageData;

    export let form: ActionData;

    $: if(form?.success && browser) { invalidateAll() }

</script>

<h2 class="leading-10">{data.article.name}</h2>

<form action="?/editArticle" method="post">

    <Flex direction="col" gap={2} class="w-1/3 my-4">
        <FormInput name="name" label="Nom de l'article" labelMandatory={true} value={data.article.name} />
        <FormInput name="quantity" type="number" label="Quantité en stock" labelMandatory={true} value={data.article.quantity} />
        <FormInput name="reference" label="Référence" value={data.article.reference} />
        <FormInput name="supplier" label="Fournisseur" value={data.article.supplier} />
        <FormInput name="manufacturer" label="Fabricant" value={data.article.manufacturer} />
        
        <Button class="self-start" borderColor="ring-amber-500" hoverColor="hover:bg-amber-500">Modifier</Button>
    </Flex>

</form>

<h3 class="leading-10">Zone de danger</h3>

<form action="?/deleteArticle" method="post">
    <Button borderColor="ring-red-500" hoverColor="hover:bg-red-500">Supprimer l'article</Button>
</form>

<form action="?/copyArticle" method="post">
    <Button borderColor="ring-amber-500" hoverColor="hover:bg-amber-500">Copier l'article</Button>
</form>
