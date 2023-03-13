<script>
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

</script>

<button class="shrink-0 bg-white shadow-2xl duration-300 text-start {$isShrinked ? "p-4" : "py-6 px-8"}" on:click|self={() => $isShrinked = !$isShrinked} on:mouseenter={mouseEnter} on:mouseleave={mouseLeave}>
    <Flex direction="col" gap={2}>
        <slot />
    </Flex>
</button>