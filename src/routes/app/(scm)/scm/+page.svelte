<script>
    import HomeMenuGrid from "$lib/components/HomeMenuGrid.svelte";
    import HomeMenuItem from "$lib/components/HomeMenuItem.svelte";
    import { CircleStack, ClipboardDocumentCheck, DocumentChartBar, DocumentText, PuzzlePiece, QueueList, Truck, Wrench, Calendar, ArchiveBox } from "@steeze-ui/heroicons";

</script>

<HomeMenuGrid>
    
    <HomeMenuItem icon={CircleStack} href="/app/scm/articles" title="Base articles" />
    <HomeMenuItem icon={Truck} href="/app/scm/suppliers" title="Fournisseurs" />
    <HomeMenuItem icon={ArchiveBox} href="/app/scm/stores" title="Stocks" />

    <HomeMenuItem icon={QueueList} href="/app/scm/approx" title="Approvisionements" />

    <HomeMenuItem icon={ClipboardDocumentCheck} href="/app/scm/lists" title="Listes d'achats" />
    <HomeMenuItem icon={PuzzlePiece} href="/app/scm/assemblies" title="Assemblages" />

    <HomeMenuItem icon={DocumentText} href="/app/scm/projects" title="Affaires" />
    <HomeMenuItem icon={DocumentChartBar} href="/app/scm/orders" title="Commandes" />
    <HomeMenuItem icon={Wrench} href="/app/scm/fabrication_orders" title="Ordres de fabrication" />

</HomeMenuGrid>