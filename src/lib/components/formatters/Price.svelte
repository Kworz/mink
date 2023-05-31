<script lang="ts">
    export let value: number | undefined;
</script>

{#if value === 0 || value === undefined}
    — €
{:else}
    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)}
{/if}
