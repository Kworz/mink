<script lang="ts">
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import FormInput from "../inputs/FormInput.svelte";

    export let itemsPerPage: number;
    export let totalPages: number;
    export let currentPage: number;

</script>

{#if totalPages > 1}
    <Flex class="{$$props.class}" items="center">
        <FormInput type="select" name="page" bind:value={currentPage} label="Page">
            {#each [...Array(totalPages).keys()] as number}
                <option value={number + 1}>{number + 1}</option>
            {/each}
        </FormInput>

        <FormInput type="select" name="page-items-count" bind:value={itemsPerPage} label="Éléments par page">
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
        </FormInput>
    </Flex>
{/if}