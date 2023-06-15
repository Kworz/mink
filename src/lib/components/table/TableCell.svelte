<script lang="ts">
    export let colspan: number | undefined = undefined;
    import type { TransitionConfig } from "svelte/transition";    
</script>

<td class="p-4 {$$props.class}" {colspan}><slot /></td>