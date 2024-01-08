<script lang="ts">
    import Button from "$lib/components/generics/Button.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import Grid from "$lib/components/generics/layout/grid.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { fade } from "svelte/transition";

    import type { ActionData } from "./$types";
    import { page } from "$app/stores";

    export let form: ActionData;

    $: if(form !== null) { setTimeout(() => form = null, 5000) }

</script>

<Flex class="h-screen w-screen" items="center" justify="center">

    <div class="bg-zinc-800 min-w-[33%] p-6 rounded-lg ring-1 ring-zinc-400/25 shadow-xl">

        <h1>Connexion</h1>
        <p>Connectez vous pour utiliser mink.</p>

        {#if $page.url.searchParams.has("registered")}
            <p class="text-emerald-500 font-medium mt-3">Connectez vous avec votre compte crée précédemment.</p>
        {/if}

        {#if form?.error}
            <p class="text-red-500 font-medium mt-3" in:fade out:fade>{form.error}</p>
        {/if}

        <form method="post" use:enhanceNoReset>
            <Flex direction="col" class="mt-8">

                <FormInput name="username" type="text" label="Nom d'utilisateur" labelMandatory invalid={form?.error !== undefined} />
                <FormInput name="password" type="password" label="Mot de passe" labelMandatory invalid={form?.error !== undefined} />

                <div class="h-[1px] mx-auto w-2/3 my-4 bg-zinc-400/50"/>

                <Grid cols={1}>
                    <Button>Connexion</Button>
                    <a href="/register">
                        <Button class="w-full" role="tertiary" size="small">S'inscrire</Button>
                    </a>
                </Grid>
            </Flex>    
        </form>
    </div>
</Flex>