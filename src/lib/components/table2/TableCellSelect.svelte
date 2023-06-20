<script lang="ts">

    import TableCell from "../table2/TableCell.svelte";

    export let value: string;
    export let group: string[];

</script>

<TableCell position="center"><input type="checkbox" bind:group {value} /></TableCell>