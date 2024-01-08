<script context="module" lang="ts">

    export type OrderStateOptions = "draft" | "quotation" | "ordered" | "acknowledged" | "cancelled" | "completed";
    
    export const OrderStateOptionsValues: Record<OrderStateOptions, string> = {
        "draft": "draft",
        "quotation": "quotation",
        "ordered": "ordered",
        "acknowledged": "acknowledged",
        "cancelled": "cancelled",
        "completed": "completed"
    };

</script>

<script lang="ts">

    import RoundedLabel from "$lib/components/generics/RoundedLabel.svelte";
    import { ArchiveBoxXMark, Check, DocumentMagnifyingGlass, DocumentText, Envelope, EnvelopeOpen } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    
    export let state: OrderStateOptions;

    let icons: Record<OrderStateOptions, typeof DocumentText> = {
        "draft": DocumentText,
        "quotation": DocumentMagnifyingGlass,
        "ordered": Envelope,
        "acknowledged": EnvelopeOpen,
        "cancelled": ArchiveBoxXMark,
        "completed": Check
    };

    let names: Record<OrderStateOptions, string> = {
        "draft": "Brouillon",
        "quotation": "Demande de devis",
        "ordered": "Commandé",
        "acknowledged": "A/R recu",
        "completed": "Terminée",
        "cancelled": "Anullée"
    };

    let roleChoosen = {
        "draft": "secondary",
        "quotation": "info",
        "ordered": "warning",
        "acknowledged": "info",
        "completed": "success",
        "cancelled": "warning"
    };

</script>

<RoundedLabel role={roleChoosen[state]}>
    {names[state]}
    <Icon src={icons[state]} class="h-4 w-4 ml-1 mb-1 inline" />
</RoundedLabel>