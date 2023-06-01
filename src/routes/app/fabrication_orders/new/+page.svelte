<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import ArticleFinder from "$lib/components/article/ArticleFinder.svelte";
    import type { ArticleResponseExpanded } from "../../articles/+page.server";

    import type { PageData } from "./$types";
    export let data: PageData;

    let selectedArticle: ArticleResponseExpanded | undefined = undefined;

</script>

<h2>Créer un ordre de fabrication</h2>

<Wrapper>
    
    <form method="post" use:enhance class="flex flex-col gap-4 mt-6">
    
        <ArticleFinder bind:selectedArticle />
    
        <input type="hidden" name="article" value={selectedArticle?.id} />
    
        <FormInput type="number" name="quantity" label="Quantité a fabriquer" labelMandatory={true} />
        <FormInput type="select" name="receiver" label="Receveur de la demande" labelMandatory={true}>
            {#each data.users as user}
                <option value={user.id}>{user.username}</option>
            {/each}
        </FormInput>
    
        <FormInput type="select" name="project" label="Affaire liée">
            {#each data.projects as project}
                <option value={project.id}>{project.name}</option>
            {/each}
        </FormInput>
    
        <FormInput type="date" name="end_date" label="Date butoir" labelMandatory={true} />
    
        <Button>Créer l'ordre de fabrication</Button>
        
    </form>

</Wrapper>

