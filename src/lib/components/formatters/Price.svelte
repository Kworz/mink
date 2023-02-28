<script lang="ts">
    export let value: number;
</script>

{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)}