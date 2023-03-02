<script lang="ts">
    export let colspan: number | undefined = undefined;
</script>

<td class="p-4 {$$props.class}" {colspan}><slot /></td>