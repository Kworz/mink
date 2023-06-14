<script lang="ts">
    import { browser } from "$app/environment";
    import { Cube, Document, Map } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";

    import { env } from "$env/dynamic/public";

    export let fileName: string;
    export let collectionName: string;
    export let collectionID: string;
    export let selected = false

    $: isImage = fileName.match(/(.*\/)*.+\.(png|jpg|gif|bmp|jpeg|webp|PNG|JPG|GIF|BMP|JPEG|WEBP)/)?.at(0) !== undefined;
    $: isStlFile = fileName.match(/(.*\/)*.+\.(stl|STL)/)?.at(0) !== undefined;
    $: isPDFFile = fileName.match(/(.*\/)*.+\.(pdf|PDF)/)?.at(0) !== undefined;
    $: extension = fileName.split(".").at(-1)?.toUpperCase();

</script>

{#if browser}
    <button class="aspect-square {selected === false ? "border-zinc-500/50 border" : "border-blue-500/50 border-2"} duration-100 rounded-[3px] bg-white relative" on:click>
        {#if isImage}
            <img src="http://{env.PUBLIC_POCKETBASE_ADDRESS}/api/files/{collectionName}/{collectionID}/{fileName}?thumb=100x100" alt={fileName} class="aspect-square object-cover" />
        {:else if isStlFile}
            <Icon src={Cube} class="h-12 w-12 m-auto text-zinc-500" />
        {:else if extension === "DXF"}
            <Icon src={Map} class="h-12 w-12 m-auto text-zinc-500" />
            <span class="text-sm text-zinc-600 font-medium">{extension}</span>
        {:else}
            <Icon src={Document} class="h-12 w-12 m-auto text-zinc-500/50" />
            <span class="text-sm text-zinc-600 font-medium">{extension}</span>
        {/if}
    </button>
{/if}