<script>
    import Flex from "$lib/components/generics/layout/flex.svelte";
</script>

<Flex items="center" class="hidden group-hover:flex mt-4 mb-2 {$$props.class || ""}">
    <span class="group-hover:inline-block hidden text-sm dark:text-zinc-800 text-white"><slot /></span>
    <div class="h-[1px] grow bg-violet-500/50" />
</Flex>
