<script lang="ts">
    import { _ } from "svelte-i18n";
    import RoundedLabel from "../../generics/RoundedLabel.svelte";
    import type { ComponentProps } from "svelte";

    export let value: boolean;

    // Additional properties
    export let format: "truefalse" | "yesno" = "yesno";
    export let size: ComponentProps<RoundedLabel>["size"] = "sm";
</script>

<RoundedLabel {size} role={value ? "success" : "danger"}>
    {$_(`app.generic.${format === "yesno" ? "boolean-other" : "boolean"}.${value}`)}
</RoundedLabel>