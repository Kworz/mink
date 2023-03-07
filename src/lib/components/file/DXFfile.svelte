<script lang="ts">

    import { onMount } from "svelte";
    import { Helper } from "dxf";

    export let url: string;
    let svgContent: string | undefined = undefined;

    onMount(async () => {
        const data = await (await fetch(url)).text();
        const helper = new Helper(data);
        svgContent = helper.toSVG();
    });

</script>

<div class="p-4 h-full w-full">
    {#if svgContent !== undefined}
        {@html svgContent}
    {/if}
</div>
