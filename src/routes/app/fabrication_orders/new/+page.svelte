<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";

    import type { PageData } from "./$types";
    export let data: PageData;

</script>

<h2>Créer un ordre de fabrication</h2>

<form method="post" use:enhance class="flex flex-col gap-4 mt-6">

    <FormInput name="article" label="Article a fabriquer" labelMandatory={true} type="select">
        {#each data.articles as article}
            <option value={article.id}>{article.name}</option>
        {/each}
    </FormInput>

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

