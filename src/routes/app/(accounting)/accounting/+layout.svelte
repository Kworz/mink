<script lang="ts">
    
    import { ChevronLeft, ChevronRight, ChartPie, DocumentMagnifyingGlass, Banknotes, Document, ArrowUpOnSquareStack } from "@steeze-ui/heroicons";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import Menu from "$lib/components/generics/menu/Menu.svelte";
    import MenuItem from "$lib/components/generics/menu/MenuItem.svelte";
    import MenuSeparator from "$lib/components/generics/menu/MenuSeparator.svelte";
    import { page } from "$app/stores";

</script>

<Flex gap={0} class="h-screen w-screen overflow-hidden" direction={$page.data.userSettings?.app_menu_left === false ? "rowReverse" : "row"}>
    <Menu>
        <MenuItem icon={$page.data.userSettings?.app_menu_left ? ChevronLeft : ChevronRight} href="/app" label="Accueil" />

        <MenuSeparator />
        <MenuItem icon={ChartPie} href="/app/accounting/" label="Santé financière" />
        <MenuItem icon={ArrowUpOnSquareStack} href="/app/accounting/transactions/" label="Transactions" />
        <MenuItem icon={DocumentMagnifyingGlass} href="/app/accounting/quotations" label="Devis" />
        <MenuItem icon={Banknotes} href="/app/accounting/invoices" label="Interets" />
        <MenuItem icon={Document} href="/app/accounting/orders" label="Factures" />

    </Menu>

    <div class="grow overflow-x-hidden overflow-y-scroll">

        <div class="relative w-full p-10 pl-6" id="main_content">
            <slot />
        </div>
    </div>
</Flex>