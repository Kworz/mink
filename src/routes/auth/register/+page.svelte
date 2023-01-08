<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Grid from "$lib/components/layout/grid.svelte";

    import type { ActionData } from "./$types";

    export let form: ActionData;

</script>

<Flex class="h-screen w-screen" items="center" justify="center">

    <div class="bg-zinc-100/50 min-w-[33%] p-6 rounded-xl border border-violet-500/50 shadow-xl">

        <h1>S'inscrire</h1>
        <p>Inscrivez vous sur Nomenclaturize2.</p>

        <form method="post">
            <Flex direction="col" gap={2} class="mt-8">
                <Input name="username" label="Nom d'utilisateur" labelMandatory={true} />

                <Input name="email" type="email" label="Email" labelMandatory={true} />

                <Input name="password" type="password" label="Mot de passe" labelMandatory={true} class="mt-2" />
                <Input name="passwordConfirm" type="password" label="Confirmer le mot de passe" labelMandatory={true} />

                <div class="h-[1px] mx-auto w-2/3 my-4 bg-violet-500/50"/>

                <Grid cols={2}>
                    <a href="/auth/register">
                        <Button class="w-full ring-gray-600 hover:bg-gray-600">Connexion</Button>
                    </a>
                    <Button ringColor="ring-blue-500" hoverColor="hover:bg-blue-500">S'inscrire</Button>
                </Grid>
            </Flex>    
        </form>
    </div>
</Flex>