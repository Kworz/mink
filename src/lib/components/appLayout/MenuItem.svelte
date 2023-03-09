<script lang="ts">
    import { page } from "$app/stores";


    import type { IconSource } from "@steeze-ui/heroicons/types";
    import { Icon } from "@steeze-ui/svelte-icon";
    
    export let icon: IconSource;
    export let href: string;
    export let label: string;

    $: active = $page.route.id?.includes(href); 

</script>

<a {href}>
    <div 
        class="flex gap-2 rounded-md py-2 px-4 items-center duration-200 font-medium {active ? "bg-violet-500 hover:bg-violet-500/90 text-white" : "hover:bg-violet-200 hover:text-violet-700 text-zinc-800"}"
    >
        <Icon src={icon} class="h-4 w-4" />
        <span>{label}</span>
    </div>
</a>