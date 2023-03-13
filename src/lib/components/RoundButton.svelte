<script lang="ts">

    import type { IconSource } from "@steeze-ui/heroicons/types";
    import { Icon } from "@steeze-ui/svelte-icon";
    export let icon: IconSource;

</script>

<button class="relative p-1 aspect-square bg-gray-200 dark:bg-gray-500 dark:hover:bg-gray-600 hover:bg-gray-300 duration-100 rounded-full {$$props.class}" on:click>
    <Icon src={icon} class="h-4 w-4 text-gray-500 dark:text-gray-200"/>
</button>