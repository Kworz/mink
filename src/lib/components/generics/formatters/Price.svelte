<script lang="ts">
    export let value: number | null | undefined;
</script>

{#if value === 0 || value === undefined || value === null || isNaN(value)}
    — €
{:else}
    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)}
{/if}
