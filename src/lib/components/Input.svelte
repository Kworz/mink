<script lang="ts">

    export let value: string;

    export let placeholder: string | undefined = undefined;

</script>

<input bind:value {placeholder} type="text" class="ring-2 ring-inset ring-zinc-500 p-2 rounded-md" />