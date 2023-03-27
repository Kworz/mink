<script lang="ts">

    export let zIndex: number = 0;

    export let selected = false;

    $: lines = zIndex === 20 ? "" : " before:content-[''] before:block before:absolute before:w-6 before:h-[1.5px] before:bg-zinc-400 before:left-[-1.5rem] before:top-[1.125rem] after:content-[''] after:block after:absolute after:bg-zinc-400 after:left-[-1.5rem] after:top-[-2.77rem] after:w-[1.5px] after:h-16";

</script>

<button class="{selected ? "hover:bg-violet-400 hover:text-violet-800 bg-violet-500 text-white" : "hover:bg-violet-300 hover:text-violet-900 bg-gray-200 dark:bg-zinc-700"} rounded-md py-2 px-3 font-medium duration-200 relative text-left {lines}" on:click style:z-index={zIndex}>
    <slot />
</button>