<script lang="ts">

    export let textColor = "hover:text-white text-zinc-800";
    export let hoverColor = "hover:bg-violet-500";
    export let ringColor = "ring-violet-500";

</script>

<button class="ring-2 ring-inset {ringColor} {hoverColor} {textColor} duration-100 py-2 px-4 rounded-md font-bold {$$props.class}" on:click>
    <slot />
</button>