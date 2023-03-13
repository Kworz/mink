<script lang="ts">

    import Portal from "svelte-portal";

</script>

<Portal target="#side_menu">
    <div class="h-screen w-max shrink-0 bg-white shadow-2xl duration-300 py-6 px-8">
        <slot />
    </div>
</Portal>