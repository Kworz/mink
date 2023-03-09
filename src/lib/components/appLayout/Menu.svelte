<script>
    import Flex from "../layout/flex.svelte";
</script>

<div class="shrink-0 bg-white shadow-2xl duration-300 py-6 px-8">
    <Flex direction="col" gap={2}>
        <slot/>
    </Flex>
</div>