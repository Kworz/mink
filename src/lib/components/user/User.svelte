<script lang="ts">
    import { browser } from "$app/environment";
    import type { User as UserDB } from "@prisma/client";
    import { User } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";

    //export let user: UserDB;

    let user = {};
</script>

<a href="/app/users/{user.id}" class="inline-flex shrink-0 flex-row items-center gap-3 p-1 pr-4 rounded-full bg-zinc-700 dark:bg-white text-white dark:text-zinc-700 hover:text-violet-400">
    {#if user.avatar !== "" && user.avatar !== undefined && browser}
        <img src={user.avatar} class="w-6 h-6 rounded-full" alt={user.username + " avatar"} />
    {:else}
        <Icon src={ User } class="h-6 w-6 p-1 text-gray-500 bg-white dark:bg-zinc-800 rounded-full" />
    {/if}
    <span class="text-sm font-medium block">{user.username}</span>
</a>