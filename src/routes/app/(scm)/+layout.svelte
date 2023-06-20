<script lang="ts">
    
    import Flex from "$lib/components/layout/flex.svelte";
    import { CircleStack, Calendar, DocumentText, ClipboardDocumentCheck, Wrench, Truck, DocumentChartBar, QueueList, QrCode, PuzzlePiece, ChevronLeft } from "@steeze-ui/heroicons";
    import Menu from "$lib/components/appLayout/Menu.svelte";
    import MenuItem from "$lib/components/appLayout/MenuItem.svelte";
    import TopBar from "$lib/components/appLayout/TopBar.svelte";
    import MenuSeparator from "$lib/components/appLayout/MenuSeparator.svelte";
    import MenuCloseButton from "$lib/components/appLayout/MenuCloseButton.svelte";

</script>

<Flex gap={0} class="h-screen w-screen overflow-hidden">
    <Menu>
        <MenuItem icon={ChevronLeft} href="/app" label="Accueil" />
        <MenuCloseButton />
        
        <MenuSeparator>Outils</MenuSeparator>
        <MenuItem icon={QrCode} href="/app/scanner" label="Scanner QRCode" />

        <MenuSeparator>Articles</MenuSeparator>
        <MenuItem icon={CircleStack} href="/app/scm/articles" label="Base articles" />
        <MenuItem icon={Truck} href="/app/scm/suppliers" label="Fournisseurs" />
        <MenuItem icon={QueueList} href="/app/scm/approx" label="Approvisionements" />

        <MenuSeparator>Nomenclatures</MenuSeparator>
        <MenuItem icon={ClipboardDocumentCheck} href="/app/scm/lists" label="Listes d'achats" />
        <MenuItem icon={PuzzlePiece} href="/app/scm/assemblies" label="Assemblages" />

        <MenuSeparator>Gestion</MenuSeparator>
        <MenuItem icon={DocumentText} href="/app/scm/projects" label="Affaires" />
        <MenuItem icon={DocumentChartBar} href="/app/scm/orders" label="Commandes" />
        <MenuItem icon={Wrench} href="/app/scm/fabrication_orders" label="Ordres de fabrication" />

    </Menu>

    <div class="grow overflow-x-hidden overflow-y-scroll">
        <TopBar />
        <div class="w-full p-6" id="main_content">
            <slot />
        </div>
    </div>

    <div class="h-screen" id="side_menu" />
</Flex>