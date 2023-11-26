<script>
    import { Wrench } from "@steeze-ui/heroicons";
    import Flex from "../layout/flex.svelte";
    import MenuItem from "./MenuItem.svelte";
    import MenuUser from "./MenuUser.svelte";
    import { page } from "$app/stores";
</script>

<nav class=" flex flex-col justify-between m-4 group z-10 h-[calc(100% - 2rem)] rounded-xl dark:bg-white bg-zinc-800 overflow-y-auto shadow-3xl duration-300 text-start p-4 group-hover:p-8 shrink-0">
    <Flex direction="col" gap={2}>
        <slot />
    </Flex>

    <Flex direction="col" gap={2}>

        <div class="h-[1px] bg-zinc-600 dark:bg-zinc-200 w-2/3 mx-auto" />
        
        <MenuItem icon={Wrench} href="/app/settings" label="Réglages" />
        <MenuUser user={$page.data.session?.user} />
    
    </Flex>
</nav>