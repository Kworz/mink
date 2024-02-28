<script>
    import { page } from "$app/stores";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import MenuItem from "$lib/components/generics/menu/MenuItem.svelte";
    import MenuUser from "$lib/components/generics/menu/MenuUser.svelte";
    import { Wrench } from "@steeze-ui/heroicons";
</script>

<nav class="flex flex-col justify-between m-4 group z-10 h-[calc(100% - 2rem)] rounded-xl ring-1 ring-zinc-400/25 bg-zinc-800 overflow-y-auto shadow-3xl duration-300 text-start p-4 group-hover:p-8 shrink-0" id="navbar">
    
    <Flex direction="col" gap={2}>
        <slot />
    </Flex>

    <Flex direction="col" gap={2}>

        <div class="h-[1px] bg-zinc-600 dark:bg-zinc-200 w-2/3 mx-auto" />
        
        <MenuItem icon={Wrench} href="/app/settings" label="Réglages" />
        <MenuUser user={$page.data.user} />
    
    </Flex>
</nav>