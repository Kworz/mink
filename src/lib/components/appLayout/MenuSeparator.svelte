<script>
    import Flex from "../layout/flex.svelte";
</script>

<Flex items="center" class="mt-4 mb-2">
    <span class="text-sm"><slot /></span>
    <div class="h-[1px] grow bg-violet-500/50" />
</Flex>