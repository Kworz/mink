<script lang="ts">
    import { page } from "$app/stores";

    import type { GroupPermissions, PermissionLevel } from "$lib/permission";

    export let level: PermissionLevel | PermissionLevel[];
    export let permission: GroupPermissions;

    $: canAccess = Array.isArray(level)
        ? level.some((l) => $page.data.user?.group?.[permission]?.includes(l) ?? false)
        : $page.data.user?.group?.[permission]?.includes(level) ?? false

</script>

{#if canAccess}
    <slot />
{/if}

