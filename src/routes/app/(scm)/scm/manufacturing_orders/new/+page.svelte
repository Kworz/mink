<script lang="ts">
    import { enhance } from "$app/forms";
    import ArticleFinder from "$lib/components/derived/article/ArticleFinder.svelte";
    import type { scm_articleWithIncludes } from "$lib/components/derived/article/article";
    import Button from "$lib/components/generics/Button.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import { _ } from "svelte-i18n";
    import type { PageData } from "./$types";

    export let data: PageData;

    let selectedArticle: scm_articleWithIncludes | undefined = undefined;
</script>

<svelte:head>
    <title>{$_('scm.manufacturing_orders.actions.create')} — mink</title>
</svelte:head>

<h1>{$_('scm.manufacturing_orders.actions.create')}</h1>
<p>{$_('scm.manufacturing_orders.create.description')}</p>

<form method="post" use:enhance class="flex flex-col gap-4 mt-6">

    <ArticleFinder bind:selectedArticle articles={data.articles} />
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

    <Button>Créer l'ordre de manufacturing</Button>
</form>