<script lang="ts">
    import Button from "$lib/components/generics/Button.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import FormInput from "../inputs/FormInput.svelte";

    export let itemsPerPage: number;
    export let totalPages: number;
    export let currentPage: number;

</script>

{#if totalPages > 1}
    <Flex class="mt-6 {$$props.class}" items="center">
        {#each [...Array(totalPages).keys()] as number}
            {@const roleMinus = (currentPage <= 0) ? number + 1 === 1 : number + 1 === currentPage}
            {@const rolePlus = (currentPage > totalPages) ? number + 1 === totalPages : number + 1 === currentPage}
            <Button 
                class="aspect-square w-8"
                size="tiny"
                role={(roleMinus || rolePlus) ? "primary" : "tertiary"}
                on:click={() => currentPage = (number+1) }
            >{number + 1}</Button>
        {/each}

        <span class="ml-2">Éléments par page</span>

        <FormInput type="select" name="page-items-count" bind:value={itemsPerPage}>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
        </FormInput>
    </Flex>
{/if}