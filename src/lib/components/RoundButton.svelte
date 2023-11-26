<script lang="ts">

    import type { IconSource } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    export let icon: IconSource;

</script>

<button class="p-1 aspect-square bg-gray-200 dark:bg-zinc-600 dark:hover:bg-zinc-700/90 hover:bg-gray-300 text-gray-500 dark:text-gray-200 duration-100 rounded-full {$$props.class || ""}" on:click>
    <Icon src={icon} class="h-4 w-4"/>
</button>