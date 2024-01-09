<script>
    import Button from "./generics/Button.svelte";
    import Wrapper from "./generics/containers/Wrapper.svelte";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { CubeTransparent } from "@steeze-ui/heroicons";
</script>

<Wrapper class="mt-6">
    <div class="flex flex-row gap-8 items-center">
        <Icon src={CubeTransparent} class="w-36 text-violet-500" theme="solid" />
        <div>
            <h2>Aucun élément à afficher 😅</h2>
            <p class="mb-4">Vous n'avez pas encore créé d'élément ici!</p>
            <Button on:click size="small" class="self-center">Créer votre premier élément</Button>
        </div>
    </div>
</Wrapper>
