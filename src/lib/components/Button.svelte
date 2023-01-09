<script lang="ts">

    export let textColor = "hover:text-white text-zinc-800";
    export let hoverColor = "hover:bg-violet-500";
    export let borderColor = "border-violet-500";

</script>

<button class="border-2 {borderColor} {hoverColor} {textColor} duration-100 py-2 px-4 rounded-sm font-bold {$$props.class}" on:click>
    <slot />
</button>