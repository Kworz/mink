<script lang="ts">
    import Button from "../Button.svelte";
    import Flex from "../layout/flex.svelte";

    export let totalPages: number;
    export let currentPage: number;

</script>

{#if totalPages > 1}
    <Flex class="mt-6">
        {#each [...Array(totalPages).keys()] as number}
            {@const roleMinus = (currentPage <= 0) ? number + 1 === 1 : number + 1 === currentPage}
            {@const rolePlus = (currentPage > totalPages) ? number + 1 === totalPages : number + 1 === currentPage}
            <Button 
                class="aspect-square w-8"
                size="tiny"
                role={(roleMinus || rolePlus) ? "primary" : "tertiary"}
                on:click={() => currentPage = (number+1)}
            >{number + 1}</Button>
        {/each}
    </Flex>
{/if}