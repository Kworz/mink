<script lang="ts">

    export let value: string;

    export let placeholder: string | undefined = undefined;

</script>

<input bind:value {placeholder} type="text" class="border bg-zinc-100 border-zinc-500/50 p-2 rounded-sm" />