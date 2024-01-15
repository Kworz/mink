<script lang="ts">

    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import { _ } from "svelte-i18n";
    import { enhance } from "$app/forms";
    import Button from "$lib/components/generics/Button.svelte";
    import type { ActionData } from "./$types";
    import { fade } from "svelte/transition";
    import { page } from "$app/stores";

    export let form: ActionData;

    let formSent = false;

    $: if(form !== null) { formSent = false; setTimeout(() => form = null, 3000); }

</script>

<svelte:head>
    <title>{$_('app.setup_s3.title')} — Installation mink</title>
</svelte:head>

<h4>{$_('app.setup_s3.title')}</h4>

{#if form?.setupS3.error}
    <p class="text-red-500 font-semibold" in:fade out:fade>{$_(form.setupS3.error)}</p>
{/if}

<form action="?/setupS3" method="post" use:enhance class="flex flex-col gap-4 mt-6" on:submit={() => formSent = true}>

    <FormInput label={$_('app.setup_s3.s3_region')} name="s3_region" type="select" required required autocomplete="s3_region">
        <option value="eu-west-1">eu-west-1</option>
        <option value="eu-west-2">eu-west-2</option>
        <option value="eu-west-3">eu-west-3</option>
        <option value="eu-central-1">eu-central-1</option>
        <option value="eu-north-1">eu-north-1</option>
        <hr>
        <option value="us-east-1">us-east-1</option>
        <option value="us-east-2">us-east-2</option>
        <option value="us-west-1">us-west-1</option>
        <option value="us-west-2">us-west-2</option>
        <hr>
        <option value="ca-central-1">ca-central-1</option>
        <hr>
        <option value="ap-east-1">ap-east-1</option>
        <option value="ap-south-1">ap-south-1</option>
        <option value="ap-northeast-1">ap-northeast-1</option>
        <option value="ap-northeast-2">ap-northeast-2</option>
        <option value="ap-northeast-3">ap-northeast-3</option>
        <option value="ap-southeast-1">ap-southeast-1</option>
        <option value="ap-southeast-2">ap-southeast-2</option>
        <hr>
        <option value="cn-north-1">cn-north-1</option>
        <option value="cn-northwest-1">cn-northwest-1</option>
        <hr>
        <option value="me-south-1">me-south-1</option>
        <hr>
        <option value="sa-east-1">sa-east-1</option>
    </FormInput>

    <FormInput label={$_('app.setup_s3.s3_bucket')} name="s3_bucket" type="text" required required autocomplete="s3_bucket" />

    <div class="flex flex-row gap-6">
        <Button suspense={formSent}>{$_('app.action.validate')}</Button>
    </div>
</form>