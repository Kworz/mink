<script lang="ts">

    import ArticleForm from "$lib/components/article/ArticleForm.svelte";
    import Button from "$lib/components/Button.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";

</script>

<Wrapper>
    <h2 class="mb-4">Créer un article</h2>
    
    <form action="?/create" method="POST">
        <ArticleForm />
        <Button class="mt-4">Ajouter</Button>
    </form>
</Wrapper>
