<script lang="ts">
    import { ChevronDown, ChevronUp } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";

    export let direction: "asc" | "desc" = "asc";
    export let active = false;

</script>

<button on:click>
    <Icon src={direction === "asc" ? ChevronUp : ChevronDown} class="h-4 w-4 font-bold {active ? "text-violet-500 dark:text-violet-400" : "text-zinc-800 dark:text-white"}" theme="solid" />
</button>