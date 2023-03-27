<script lang="ts">
    import { browser } from "$app/environment";
    import type { UsersResponse } from "$lib/DBTypes";
    import { User } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    export let user: UsersResponse;

</script>

<a href="/app/users/{user.id}" class="flex flex-row items-center gap-3 p-1 pr-4 rounded-full bg-zinc-700 dark:bg-white text-white dark:text-zinc-700 hover:text-violet-400">
    {#if user.avatar !== "" && user.avatar !== undefined && browser}
        <img src="http://{window.location.hostname}:8090/api/files/{user.collectionName}/{user.id}/{user.avatar}?thumb=100x100" class="w-6 h-6 rounded-full" alt={user.username + " avatar"} />
    {:else}
        <Icon src={ User } class="h-6 w-6 p-1 text-gray-500 bg-white dark:bg-zinc-800 rounded-full" />
    {/if}
    <span class="text-sm font-medium block">{user.username}</span>
</a>