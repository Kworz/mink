<script>
    import { Wrench } from "@steeze-ui/heroicons";
    import Flex from "../layout/flex.svelte";
    import MenuItem from "./MenuItem.svelte";
    import MenuUser from "./MenuUser.svelte";
    import { page } from "$app/stores";
</script>

<nav class="m-4 group z-10 h-[calc(100% - 2rem)] rounded-xl dark:bg-white bg-zinc-800 overflow-y-auto shadow-3xl duration-300 text-start p-4 group-hover:p-8 flex flex-col justify-between">
    <Flex direction="col" gap={2}>
        <slot />
    </Flex>

    <Flex direction="col" gap={2}>
        
        <MenuItem icon={Wrench} href="/app/settings" label="Réglages" />
        <MenuUser user={$page.data.session?.user} />
    
    </Flex>
</nav>