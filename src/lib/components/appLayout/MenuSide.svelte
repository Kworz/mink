<script lang="ts">

    import Portal from "svelte-portal";

</script>

<Portal target="#side_menu">
    <div class="h-screen shrink-0 bg-white dark:bg-zinc-800 shadow-2xl duration-300 py-6 px-8 hover:w-max w-8">
        <slot />
    </div>
</Portal>