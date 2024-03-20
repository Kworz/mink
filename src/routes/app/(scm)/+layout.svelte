<script lang="ts">
    
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import Menu from "$lib/components/generics/menu/Menu.svelte";
    import MenuItem from "$lib/components/generics/menu/MenuItem.svelte";
    import MenuSeparator from "$lib/components/generics/menu/MenuSeparator.svelte";
    import { ArchiveBox, ChevronLeft, ChevronRight, CircleStack, ClipboardDocumentCheck, DocumentChartBar, DocumentText, PuzzlePiece, QueueList, Truck, Wrench } from "@steeze-ui/heroicons";
    
    import type { LayoutData } from "./$types";
    import { _ } from "svelte-i18n";
    import { page } from "$app/stores";

    export let data: LayoutData;

</script>

<Flex gap={0} class="h-screen w-screen overflow-hidden" direction={$page.data.userSettings?.app_menu_left === false ? "rowReverse" : "row"}>
    <Menu>
        <MenuItem icon={$page.data.userSettings?.app_menu_left ? ChevronLeft : ChevronRight} href="/app" label="Accueil" />

        <MenuSeparator>Articles</MenuSeparator>
        <MenuItem icon={CircleStack} href="/app/scm/articles" label="Base articles" />
        <MenuItem icon={Truck} href="/app/scm/suppliers" label="Fournisseurs" />
        <MenuItem icon={ArchiveBox} href="/app/scm/stores" label={$_('app.generic.stores')} />
        <MenuItem icon={QueueList} href="/app/scm/inbound_supplies" label={$_('app.generic.inbound_supplies')} dotNumber={data.inboundSuppliesCount} />

        <MenuSeparator>Nomenclatures</MenuSeparator>
        <MenuItem icon={ClipboardDocumentCheck} href="/app/scm/lists" label="Listes d'achats" />
        <MenuItem icon={PuzzlePiece} href="/app/scm/assemblies" label={$_('app.generic.assemblies')} />

        <MenuSeparator>Gestion</MenuSeparator>
        <MenuItem icon={DocumentText} href="/app/scm/projects" label={$_('app.generic.projects')} />
        <MenuItem icon={DocumentChartBar} href="/app/scm/orders" label="Commandes" />
        <MenuItem icon={Wrench} href="/app/scm/manufacturing_orders" label={$_('app.generic.manufacturing_orders')} />

    </Menu>

    <div class="relative grow overflow-x-hidden overflow-y-scroll p-10 pl-6" id="main_content">
        <slot />
    </div>
</Flex>