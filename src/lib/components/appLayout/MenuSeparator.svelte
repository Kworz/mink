<script>
    import Flex from "../layout/flex.svelte";
    import { getMenuContext } from "./menuContext";

    const { isShrinked } = getMenuContext();

</script>

{#if !$isShrinked}
    <Flex items="center" class="mt-4 mb-2">
        <span class="text-sm"><slot /></span>
        <div class="h-[1px] grow bg-violet-500/50" />
    </Flex>
{:else}
    <div class="h-[1px] w-2/3 mx-auto bg-violet-500/50" />
{/if}
