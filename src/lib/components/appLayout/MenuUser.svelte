<script lang="ts">
    import type { User } from "@prisma/client";

    import { ArrowRightOnRectangle, User as UserIcon } from "@steeze-ui/heroicons";
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
        
        <span in:fade={{ duration: 200 }} out:fade={{ duration: 50 }} class="group-hover:inline-block hidden text-white mr-2">{user?.username}</span>

        <a href="/logout" data-sveltekit-preload-data="off" class="items-center justify-center text-xs text-red-500 hover:text-red-600/50 group-hover:flex hidden">
            Déconnexion
            <Icon src={ArrowRightOnRectangle} class="h-4 w-4 ml-1 inline-block" />
        </a>
    </div>
</a>
