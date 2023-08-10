<script lang="ts">

    export let zIndex: number = 0;

    export let last = false;

    export let id = "";

    $: lines = zIndex === 20 ? "" : ` before:content-[''] before:block before:absolute before:w-6 before:h-[1.5px] before:bg-zinc-400 before:left-[-1.5rem] before:top-[1.125rem] after:content-[''] ${!last ? "after:block" : "after:hidden"} after:absolute after:bg-zinc-400 after:left-[-1.6rem] after:top-[1rem] after:w-1.5 after:h-1.5 after:rounded-full`;

</script>

<a href="/app/scm/assemblies/{id}">
    <button class="{zIndex === 20 ? "hover:bg-violet-400 hover:text-violet-800 bg-violet-500 text-white" : "hover:bg-violet-300 hover:text-violet-900 bg-gray-200 dark:bg-zinc-700"} rounded-md py-2 px-3 font-medium duration-200 relative text-left {lines}" style:z-index={zIndex}>
        <slot />
    </button>
</a>