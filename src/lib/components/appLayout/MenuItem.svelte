<script lang="ts">
    import { page } from "$app/stores";

    import type { IconSource } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { getMenuContext } from "./menuContext";
    import { fade } from "svelte/transition";
    
    export let icon: IconSource;
    export let href: string;
    export let label: string;

    export let dotNumber: number = 0;

    const { isShrinked } = getMenuContext();

    $: active = $page.url.pathname.includes(href) && href !== "/app";

</script>

<a {href}>
    <div 
        class="flex gap-2 rounded-md relative {$isShrinked ? "p-2" : "py-2 px-4"} items-center duration-200 font-medium {active ? "bg-violet-500 hover:bg-violet-500/90 text-white" : "hover:bg-violet-200 hover:text-violet-700 dark:text-zinc-800 text-white"}"
    >
        <Icon src={icon} class="h-4 w-4" />
        
        {#if !$isShrinked}
            <span in:fade={{ duration: 200 }} out:fade={{ duration: 50 }}>{label}</span>
            {#if dotNumber > 0}
                <div in:fade={{ duration: 200 }} out:fade={{ duration: 50 }} class="block absolute bg-red-500 text-[0.5em] text-white rounded-full px-1.5 py-0.5 top-0 right-0 translate-x-1/2 -translate-y-1/2">{dotNumber}</div>
            {/if}
        {/if}
    </div>
</a>