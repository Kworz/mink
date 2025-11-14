<script lang="ts">
    import { page } from "$app/stores";

    import type { IconSource } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { fade } from "svelte/transition";
    
    export let icon: IconSource;
    export let href: string;
    export let label: string;

    export let dotNumber: number = 0;

    $: active = $page.url.pathname.includes(href) && href !== "/app";

</script>

<a {href}>
    <div 
        class="flex gap-2 rounded-md relative group-hover:px-4 p-2 items-center align-middle duration-200 font-medium"
        class:active={active}
        class:inactive={!active}
    >
        <Icon src={icon} class="h-4 w-4" />
        <span in:fade={{ duration: 200 }} out:fade={{ duration: 50 }} class="group-hover:inline-block hidden">{label}</span>
        
        {#if dotNumber > 0}
            <div in:fade={{ duration: 200 }} out:fade={{ duration: 50 }} class="absolute group-hover:relative group-hover:translate-x-0 group-hover:translate-y-0 bg-red-500 text-[0.5em] text-white rounded-full px-1.5 py-0.5 top-0 right-0 translate-x-1/2 -translate-y-1/2">{dotNumber}</div>
        {/if}
    </div>
</a>

<style lang="postcss">

    .active {
        @apply bg-violet-500 hover:bg-violet-500/90 text-white;
    }
    
    .inactive {
        @apply hover:bg-violet-200 hover:text-violet-700 text-white;
    }

</style>