<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Input from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Grid from "$lib/components/layout/grid.svelte";

    import type { ActionData } from "./$types";

    export let form: ActionData;

</script>



<Flex class="h-screen w-screen" items="center" justify="center">

    <div class="bg-white min-w-[33%] p-6 rounded-lg border border-violet-500/15 shadow-xl">

        <h1>Connexion</h1>
        <p>Connectez vous pour utiliser Nomenclaturize.</p>

        <form method="post" use:enhance>
            <Flex direction="col" class="mt-8">

                <FormInput name="email" type="email" label="Email" labelMandatory />
                <FormInput name="password" type="password" label="Mot de passe" labelMandatory />

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