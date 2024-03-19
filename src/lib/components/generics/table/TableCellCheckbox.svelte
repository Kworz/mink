<script lang="ts">
    import TableCell from "./TableCell.svelte";

    export let group: Array<string>;
    export let value: string;
</script>

<TableCell class="items-center"><input type="checkbox" bind:group {value} /></TableCell>