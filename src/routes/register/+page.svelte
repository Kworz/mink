<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$lib/components/generics/Button.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import Grid from "$lib/components/generics/layout/grid.svelte";

    import type { ActionData } from "./$types";
    export let form: ActionData;

</script>

<Flex class="h-screen w-screen" items="center" justify="center">

    <div class="bg-zinc-800 min-w-[33%] p-6 rounded-lg ring-1 ring-zinc-400/25 shadow-xl">

        <h1>S'inscrire</h1>
        <p>Inscrivez vous sur mink.</p>

        {#if form?.error}
            <p class="text-red-500 font-medium">{form.error}</p>
        {/if}

        <form method="post" use:enhance>
            <Flex direction="col" class="mt-8">
                <FormInput name="username" label="Nom d'utilisateur" labelMandatory={true} />

                <FormInput name="email" type="email" label="Email" labelMandatory={true} />

                <FormInput name="password" type="password" label="Mot de passe" labelMandatory={true} />
                <FormInput name="passwordConfirm" type="password" label="Confirmer le mot de passe" labelMandatory={true} />

                <div class="h-[1px] mx-auto w-2/3 my-4 bg-zinc-400/50"/>

                <Grid cols={1}>
                    <Button>S'inscrire</Button>
                    <a href="/login">
                        <Button class="w-full" role="tertiary" size="small">Connexion</Button>
                    </a>
                </Grid>
            </Flex>    
        </form>
    </div>
</Flex>