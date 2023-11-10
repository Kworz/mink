<script lang="ts">

    import RoundedLabel from "$lib/components/RoundedLabel.svelte";
    import { ArchiveBoxXMark, Check, DocumentMagnifyingGlass, DocumentText, Envelope, EnvelopeOpen } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    
    type OrderStateOptions = "draft" | "quotation" | "placed" | "acknowledged" | "cancelled" | "completed"

    export let state: OrderStateOptions;


    let icons: Record<OrderStateOptions, typeof DocumentText> = {
        "draft": DocumentText,
        "quotation": DocumentMagnifyingGlass,
        "placed": Envelope,
        "acknowledged": EnvelopeOpen,
        "cancelled": ArchiveBoxXMark,
        "completed": Check
    };

    let names: Record<OrderStateOptions, string> = {
        "draft": "Brouillon",
        "quotation": "Demande de devis",
        "placed": "Commandé",
        "acknowledged": "A/R recu",
        "completed": "Terminée",
        "cancelled": "Anullée"
    };

    let roleChoosen = {
        "draft": "secondary",
        "quotation": "info",
        "placed": "warning",
        "acknowledged": "info",
        "completed": "success",
        "cancelled": "warning"
    };

</script>

<RoundedLabel role={roleChoosen[state]}>
    {names[state]}
    <Icon src={icons[state]} class="h-4 w-4 ml-1 mb-1 inline" />
</RoundedLabel>