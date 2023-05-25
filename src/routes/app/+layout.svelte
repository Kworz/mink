<script lang="ts">
    
    import Flex from "$lib/components/layout/flex.svelte";
    import { ListBullet, CircleStack, Calendar, DocumentText, ClipboardDocumentCheck, Wrench, Truck, DocumentChartBar, QueueList, QrCode, PuzzlePiece } from "@steeze-ui/heroicons";
    import Menu from "$lib/components/appLayout/Menu.svelte";
    import MenuItem from "$lib/components/appLayout/MenuItem.svelte";
    import TopBar from "$lib/components/appLayout/TopBar.svelte";
    import MenuSeparator from "$lib/components/appLayout/MenuSeparator.svelte";
    import MenuCloseButton from "$lib/components/appLayout/MenuCloseButton.svelte";

</script>

<Flex gap={0} class="h-screen w-screen overflow-hidden">
    <Menu>
        <MenuCloseButton />
        <MenuSeparator>Outils</MenuSeparator>
        <MenuItem icon={QrCode} href="/app/scanner" label="Scanner QRCode" />

        <MenuSeparator>Articles</MenuSeparator>
        <MenuItem icon={CircleStack} href="/app/articles" label="Base articles" />
        <MenuItem icon={Truck} href="/app/suppliers" label="Fournisseurs" />
        <MenuItem icon={QueueList} href="/app/approx" label="Approvisionements" />

        <MenuSeparator>Nomenclatures</MenuSeparator>
        <MenuItem icon={ClipboardDocumentCheck} href="/app/lists" label="Listes d'achats" />
        <MenuItem icon={PuzzlePiece} href="/app/assemblies" label="Assemblages" />

        <MenuSeparator>Gestion</MenuSeparator>
        <MenuItem icon={DocumentText} href="/app/projects" label="Affaires" />
        <MenuItem icon={DocumentChartBar} href="/app/orders" label="Commandes" />
        <MenuItem icon={Calendar} href="/app/planning" label="Planning" />
        <MenuItem icon={Wrench} href="/app/fabrication_orders" label="Ordres de fabrication" />

    </Menu>

    <div class="grow overflow-x-hidden overflow-y-scroll">
        <TopBar />
        <div class="w-full p-6">
            <slot />
        </div>
    </div>

    <div class="h-screen" id="side_menu" />
</Flex>