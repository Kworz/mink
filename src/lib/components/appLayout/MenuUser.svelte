<script lang="ts">
    import { page } from "$app/stores";
    import type { User } from "@prisma/client";

    import { User as UserIcon } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { fade } from "svelte/transition";

    export let user: User | null | undefined;

</script>

<a href="/app/users/{user?.id}">
    <div 
        class="flex gap-2 rounded-md relative group-hover:px-4 p-2 items-center duration-200 font-medium base group-hover:base-hover"
    >
        {#if typeof user?.avatar === "string"}
            <img src={user?.avatar} alt="Avatar {user?.username}" class="h-4 w-4 rounded-xl" />
        {:else}
            <Icon src={UserIcon} class="h-4 w-4 text-white" />
        {/if}
        
        <span in:fade={{ duration: 200 }} out:fade={{ duration: 50 }} class="group-hover:inline-block hidden text-white">{user?.username}</span>
    </div>
</a>
