<script lang="ts">
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { ArrowDownTray, Document, Star, XMark } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import Flex from "../layout/flex.svelte";

    import StlFile from "./STLFile.svelte";

    export let fileName: string;
    export let collectionName: string;
    export let collectionID: string;
    export let isPinned = false;

    $: isImage = fileName.match(/(.*\/)*.+\.(png|jpg|gif|bmp|jpeg|webp|PNG|JPG|GIF|BMP|JPEG|WEBP)/)?.at(0) !== undefined;
    $: isStlFile = fileName.match(/(.*\/)*.+\.(stl|STL)/)?.at(0) !== undefined;
    $: isPDFFile = fileName.match(/(.*\/)*.+\.(pdf|PDF)/)?.at(0) !== undefined;

</script>

<div class="aspect-square border border-zinc-500/50 rounded-[3px] bg-white relative">

    <Flex class="absolute top-2 right-2 opacity-50 hover:opacity-100 duration-200" gap={1}>
        {#if isImage}
            <form action="/app/articles/{collectionID}?/pinAttachedFile" method="post" use:enhanceNoReset>
                <input type="hidden" name="pinned_file" value={isPinned ? "" : fileName} />
                <button><Icon src={Star} class="h-6 w-6 text-blue-400" theme={isPinned ? "solid" : ""}/></button>
            </form>
        {/if}
        {#if !isImage}
            <a href="http://192.168.49.240:8090/api/files/{collectionName}/{collectionID}/{fileName}">
                <Icon src={ArrowDownTray} class="h-6 w-6 text-blue-400" />
            </a>
        {/if}
        <form action="/app/articles/{collectionID}?/removeAttachedFile" method="post" use:enhanceNoReset>
            <input type="hidden" name="attached_files-" value={fileName} />
            <button><Icon src={XMark} class="h-6 w-6 text-red-400"/></button>
        </form>
    </Flex>
    {#if isImage}
        <img src="http://192.168.49.240:8090/api/files/{collectionName}/{collectionID}/{fileName}" alt={fileName} class="aspect-square object-cover" />
    {:else if isStlFile}
        <StlFile url="http://192.168.49.240:8090/api/files/{collectionName}/{collectionID}/{fileName}" />
    {:else}
        <Flex class="inset-0 m-2" direction="col">
            <Icon src={Document} class="h-32 aspect-square text-zinc-800/50" />
            <span>{fileName}</span>
        </Flex>
    {/if}
</div>