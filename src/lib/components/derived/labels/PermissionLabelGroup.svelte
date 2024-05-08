<script lang="ts">
    import type { permission } from "$lib/prisma-enums";
    import { _ } from "svelte-i18n";
    import RoundedLabel, { type Roles } from "$lib/components/generics/RoundedLabel.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";

    export let permission: permission | null;

    const permissionColors: Record<"r" | "c" | "u" | "d", Roles> = {
        "r": "primary",
        "u": "warning",
        "c": "success",
        "d": "danger",
    };

    $: permissionSplitted = (permission?.split("") ?? []) as ("r" | "c" | "u" | "d")[];

</script>

<Flex gap={2}>
    {#if permission === null}
        <RoundedLabel role="secondary" size="sm">{$_('app.permission.null')}</RoundedLabel>
    {:else}
        {#each permissionSplitted as item}
            <RoundedLabel role={permissionColors[item]} size="sm">{$_(`app.permission.solo_values.${item}`)}</RoundedLabel>
        {/each}
    {/if}
</Flex>

