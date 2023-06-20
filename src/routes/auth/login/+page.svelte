<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Grid from "$lib/components/layout/grid.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { fade } from "svelte/transition";

    import type { ActionData } from "./$types";

    export let form: ActionData;

    $: if(form !== null) { setTimeout(() => form = null, 5000) }

</script>

<Flex class="h-screen w-screen" items="center" justify="center">

    <div class="bg-white dark:bg-zinc-800 min-w-[33%] p-6 rounded-lg border border-violet-500/15 shadow-xl">

        <h1>Connexion</h1>
        <p>Connectez vous pour utiliser Nomenclaturize.</p>

        {#if form?.error}
            <p class="text-red-500 font-medium" in:fade out:fade>{form.error}</p>
        {/if}

        <form method="post" use:enhanceNoReset>
            <Flex direction="col" class="mt-8">

                <FormInput name="email" type="email" label="Email" labelMandatory invalid={form?.error !== undefined} />
                <FormInput name="password" type="password" label="Mot de passe" labelMandatory invalid={form?.error !== undefined} />

                <div class="h-[1px] mx-auto w-2/3 my-4 bg-violet-500/50"/>

                <Grid cols={1}>
                    <Button>Connexion</Button>
                    <a href="/auth/register">
                        <Button class="w-full" role="tertiary" size="small">S'inscrire</Button>
                    </a>
                </Grid>
            </Flex>    
        </form>
    </div>
</Flex>