<script lang="ts">

    import type { IconSource } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    export let icon: IconSource;

</script>

<button class="p-1 aspect-square bg-zinc-600 hover:bg-zinc-700/90 dark:text-gray-200 duration-100 rounded-full {$$props.class || ""}" on:click>
    <Icon src={icon} class="h-4 w-4"/>
</button>