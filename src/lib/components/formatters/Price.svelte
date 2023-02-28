<script lang="ts">

    export let value: number;
    export let detail: number = 2;

    $: pow = Math.pow(10, detail)

</script>

{#if value === 0}
    {"— €"}
{:else}
    {`${Math.floor(value * pow) / pow} €`}
{/if}