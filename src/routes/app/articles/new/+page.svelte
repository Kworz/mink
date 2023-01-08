<script>

    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";

</script>

<h2 class="mb-4">Créer un article</h2>

<form action="?/create" method="POST">

    <Flex direction="col" class="max-w-[33%]" gap={2}>

        <h3>Informations de base</h3>

        <Input name="name" label="Nom de l'article" labelMandatory={true}/>
        <Input type="number" name="quantity" label="Quantité disponible" labelMandatory={true} />

        <h3>Informations complémentaires</h3>

        <Input name="price" label="Prix" />
        <Input name="supplier" label="Fournisseur" />
        <Input name="reference" label="Référence" />
        <Input name="manufacturer" label="Fabricant" />

        <Button class="mt-4">Ajouter</Button>

    </Flex>
</form>