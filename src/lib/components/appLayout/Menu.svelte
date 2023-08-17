<script>
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import Flex from "../layout/flex.svelte";
    import { setMenuContext } from "./menuContext";

    const { isShrinked } = setMenuContext();

    const mouseEnter = () => {
        if($isShrinked === true)
            $isShrinked = false;
    }

    const mouseLeave = () => {
        if($isShrinked === false)
            $isShrinked = true;
    }

    onMount(() => {
        page.subscribe(() => {
            if($isShrinked === false)
                $isShrinked = true;
        });
    });

</script>

<button class="z-10 shrink-0 dark:bg-white bg-zinc-800 overflow-y-auto shadow-2xl duration-300 text-start {$isShrinked ? "w-0 overflow-x-hidden md:p-4 md:w-auto" : "py-6 w-screen md:w-auto px-8"}" on:click|self={() => $isShrinked = !$isShrinked} on:mouseenter={mouseEnter} on:mouseleave={mouseLeave}>
    <Flex direction="col" gap={$isShrinked ? 0.5 : 1.5}>
        <slot />
    </Flex>
</button>