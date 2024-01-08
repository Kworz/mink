<script lang="ts">
    import { browser } from "$app/environment";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { ArrowDownTray, Document, XMark } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import DxFfile from "$lib/components/derived/file/DXFfile.svelte";
    import StlFile from "$lib/components/derived/file/STLFile.svelte";


    import { Canvas } from "@threlte/core";

    export let fileURL: string;
    export let fancyFileName: string | undefined;
    export let attachedArticleID: string;

    $: isImage = fileURL.match(/(.*\/)*.+\.(png|jpg|gif|bmp|jpeg|webp|PNG|JPG|GIF|BMP|JPEG|WEBP)/)?.at(0) !== undefined;
    $: isStlFile = fileURL.match(/(.*\/)*.+\.(stl|STL)/)?.at(0) !== undefined;
    $: isDXFFile = fileURL.match(/(.*\/)*.+\.(dxf|DXF)/)?.at(0) !== undefined;
    $: isPDFFile = fileURL.match(/(.*\/)*.+\.(pdf|PDF)/)?.at(0) !== undefined;

</script>

{#if browser}
    <div class="aspect-square h-full bg-white relative">
    
        <Flex class="absolute top-4 right-4 opacity-50 hover:opacity-100 duration-200" gap={1}>
            {#if !isImage}
                <a href={fileURL} download={(fancyFileName) ? `${fancyFileName}.${fileURL.split(".").at(-1)}` : fileURL}>
                    <Icon src={ArrowDownTray} class="h-6 w-6 text-blue-400" />
                </a>
            {/if}
            <form action="/app/scm/articles/{attachedArticleID}?/removeAttachedFile" method="post" use:enhanceNoReset>
                <input type="hidden" name="attached_files-" value={fileURL} />
                <button><Icon src={XMark} class="h-6 w-6 text-red-400"/></button>
            </form>
        </Flex>
        {#if isImage}
            <img src={fileURL} alt={fancyFileName} class="aspect-square object-cover h-full" />
        {:else if isStlFile}
            <Canvas>
                <StlFile url={fileURL} />
            </Canvas>
        {:else if isPDFFile}
            <iframe src={fileURL} height="100%" width="100%" title="PDF File"></iframe>
        {:else if isDXFFile}
            <DxFfile url={fileURL} />
        {:else}
            <Flex class="inset-0 m-2" direction="col">
                <Icon src={Document} class="h-32 aspect-square text-zinc-800/50" />
            </Flex>
        {/if}
    </div>
{/if}