<script lang="ts">
    export let value: number;
</script>

{#if value === 0}
    — €
{:else}
    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)}
{/if}
