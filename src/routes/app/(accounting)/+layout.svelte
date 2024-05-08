<script lang="ts">
    
    import { ChevronLeft, ChevronRight, ChartPie, DocumentMagnifyingGlass, Banknotes, Document, ArrowUpOnSquareStack } from "@steeze-ui/heroicons";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import Menu from "$lib/components/generics/menu/Menu.svelte";
    import MenuItem from "$lib/components/generics/menu/MenuItem.svelte";
    import MenuGroup from "$lib/components/generics/menu/MenuGroup.svelte";
    import { page } from "$app/stores";
    import { _ } from "svelte-i18n";
    import { validatePermission } from "$lib/permission";
    import type { LayoutData } from "./$types";

    export let data: LayoutData;

</script>

<Flex gap={0} class="h-screen w-screen overflow-hidden" direction={$page.data.userSettings?.app_menu_left === false ? "rowReverse" : "row"}>
    <Menu>
        <MenuItem icon={$page.data.userSettings?.app_menu_left ? ChevronLeft : ChevronRight} href="/app" label={$_('app.generic.home')} />

        <MenuItem icon={ChartPie} href="/app/accounting/" label={$_('app.generic.accounting')} />

        <MenuGroup items={[
            !validatePermission(data.user, "transaction", "r") ? undefined : { icon: ArrowUpOnSquareStack, href: "/app/accounting/transactions/", label: $_('app.generic.transactions') },
        ]}>{$_('app.generic.financial_flows')} </MenuGroup>

        <MenuGroup items={[
            !validatePermission(data.user, "quotation", "r") ? undefined : { icon: DocumentMagnifyingGlass, href: "/app/accounting/quotations", label: $_('app.generic.quotations') },
            !validatePermission(data.user, "invoice", "r") ? undefined : { icon: Banknotes, href: "/app/accounting/invoices", label: $_('app.generic.invoices') },
            !validatePermission(data.user, "order", "r") ? undefined : { icon: Document, href: "/app/accounting/orders", label: $_('app.generic.orders') },
        ]}>{$_('app.generic.accounting')}</MenuGroup>

    </Menu>

    <div class="grow overflow-x-hidden overflow-y-scroll">

        <div class="relative w-full p-10 pl-6" id="main_content">
            <slot />
        </div>
    </div>
</Flex>