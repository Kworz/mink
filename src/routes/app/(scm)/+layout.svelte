<script lang="ts">
    
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import Menu from "$lib/components/generics/menu/Menu.svelte";
    import MenuItem from "$lib/components/generics/menu/MenuItem.svelte";
    import MenuSeparator from "$lib/components/generics/menu/MenuGroup.svelte";
    import { ArchiveBox, ChevronLeft, ChevronRight, CircleStack, ClipboardDocumentCheck, PuzzlePiece, QueueList, Truck } from "@steeze-ui/heroicons";
    
    import type { LayoutData } from "./$types";
    import { _ } from "svelte-i18n";
    import { validatePermission } from "$lib/permission";

    export let data: LayoutData;

</script>

<Flex gap={0} class="h-screen w-screen overflow-hidden" direction={data.userSettings?.app_menu_left === false ? "rowReverse" : "row"}>
    <Menu>
        <MenuItem icon={data.userSettings?.app_menu_left ? ChevronLeft : ChevronRight} href="/app" label={$_('app.generic.home')} />

        <MenuSeparator items={[
            !validatePermission(data.user, "article", "r") ? undefined : { icon: CircleStack, href: "/app/scm/articles", label: $_('app.generic.articles') },
            !validatePermission(data.user, "supplier", "r") ? undefined : { icon: Truck, href: "/app/scm/suppliers", label: $_('app.generic.suppliers') },
            !validatePermission(data.user, "store", "r") ? undefined : { icon: ArchiveBox, href: "/app/scm/stores", label: $_('app.generic.stores') },
            !validatePermission(data.user, "inbound_supplies", "r") ? undefined : { icon: QueueList, href: "/app/scm/inbound_supplies", label: $_('app.generic.inbound_supplies'), dotNumber: data.inboundSuppliesCount },
        ]}>{$_('app.generic.articles')}</MenuSeparator>

        <MenuSeparator items={[
            !validatePermission(data.user, "buylist", "r") ? undefined : { icon: ClipboardDocumentCheck, href: "/app/scm/lists", label: $_('app.generic.buylist') },
            !validatePermission(data.user, "assembly", "r") ? undefined : { icon: PuzzlePiece, href: "/app/scm/assemblies", label: $_('app.generic.assemblies') },
        ]}>{$_('app.generic.bom')}</MenuSeparator>

    </Menu>

    <div class="relative grow overflow-x-hidden overflow-y-scroll p-10 pl-6" id="main_content">
        <slot />
    </div>
</Flex>