<script lang="ts">

    import { XMark } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import Portal from "svelte-portal";

    import { createEventDispatcher, onMount } from "svelte";
    import { page } from "$app/stores";

    const dispatch = createEventDispatcher<{ close: void }>();

    export let title: string;

    onMount(() => {
        document.getElementById("main_content")!.style.filter = "blur(4px)";
        document.getElementById("navbar")!.style.filter = "blur(4px)";

        return () => {
            document.getElementById("main_content")!.style.filter = "";
            document.getElementById("navbar")!.style.filter = "";
        }
    });

</script>

<svelte:window on:keydown={e => e.key === "Escape" && dispatch("close")} />

<Portal target="body">
    <div class="absolute z-50 top-4 {$page.data.userSettings?.app_menu_left === false ? "left-4" : "right-5"} bottom-4 rounded-xl shrink-0 ring-1 ring-zinc-400/25 bg-zinc-800 shadow-2xl duration-300 p-4 min-w-[25%] overflow-y-scroll">
        <button class="absolute top-4 right-4" on:click={() => dispatch("close")}>
            <Icon src={XMark} class="h-4 w-4 text-red-500" />
        </button>

        <h3 class="mr-12">{title}</h3>
        <div class="mt-3 mb-4 h-[1px] w-full bg-zinc-400/25" />
        
        <div class="w-full duration-300 px-[1px] overflow-y-scroll">
            <slot />
        </div>
    </div>
</Portal>