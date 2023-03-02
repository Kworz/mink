<script lang="ts">

    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Input from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;

</script>

<h2 class="mb-4">Créer un article</h2>

<form action="?/create" method="POST">

    <Flex direction="col" class="max-w-[33%]" gap={2}>

        <h3>Informations de base</h3>

        <Input name="name" label="Nom de l'article" labelMandatory={true}/>
        <Input type="number" name="quantity" label="Quantité disponible" labelMandatory={true} />

        <h3>Informations complémentaires</h3>

        <Input name="price" label="Prix" />
        <FormInput type="select" name="supplier" label="Fournisseur" value={[]}>
            <option value={undefined}>—</option>
            {#if data.suppliers !== undefined}
                {#each data.suppliers as supplier}
                    <option value={supplier.id}>{supplier.name}</option>
                {/each}
            {/if}
        </FormInput>
        <Input name="reference" label="Référence" />
        <Input name="manufacturer" label="Fabricant" />

        <Button class="mt-4">Ajouter</Button>

    </Flex>
</form>