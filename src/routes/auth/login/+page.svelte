<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Input from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Grid from "$lib/components/layout/grid.svelte";

    import type { ActionData } from "./$types";

    export let form: ActionData;

</script>



<Flex class="h-screen w-screen" items="center" justify="center">

    <div class="bg-zinc-100/50 min-w-[33%] p-6 rounded-sm border border-violet-500/50 shadow-xl">

        <h1>Connexion</h1>
        <p>Connectez vous pour utiliser Nomenclaturize.</p>

        <form method="post">
            <Flex direction="col" gap={2} class="mt-8">

                <Input name="email" type="email" label="Email" labelMandatory={true} />
                <Input name="password" type="password" label="Mot de passe" labelMandatory={true} class="mt-2" />

                <div class="h-[1px] mx-auto w-2/3 my-4 bg-violet-500/50"/>

                <Grid cols={2}>
                    <a href="/auth/register">
                        <Button class="w-full" borderColor="border-zinc-500" hoverColor="hover:bg-zinc-500">S'inscrire</Button>
                    </a>
                    <Button>Connexion</Button>
                </Grid>
            </Flex>    
        </form>
    </div>
</Flex>