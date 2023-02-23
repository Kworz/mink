<script lang="ts">
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { Document, Star, XMark } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import Flex from "../layout/flex.svelte";

    export let fileName: string;
    export let collectionName: string;
    export let collectionID: string;
    export let isPinned = false;

</script>

<div class="aspect-square border border-zinc-500/50 rounded-[3px] bg-white relative">

    <Flex class="absolute top-2 right-2">
        <form action="/app/articles/{collectionID}?/removeAttachedFile" method="post" use:enhanceNoReset>
            <input type="hidden" name="attached_files-" value={fileName} />
            <button><Icon src={XMark} class="h-8 w-8 text-red-500"/></button>
        </form>
        <form action="/app/articles/{collectionID}?/pinAttachedFile" method="post" use:enhanceNoReset>
            <input type="hidden" name="pinned_file" value={isPinned ? "" : fileName} />
            <button><Icon src={Star} class="h-8 w-8 text-blue-500" theme={isPinned ? "solid" : ""}/></button>
        </form>
    </Flex>
    {#if fileName.match(/(.*\/)*.+\.(png|jpg|gif|bmp|jpeg|webp|PNG|JPG|GIF|BMP|JPEG|WEBP)/)?.at(0) !== undefined}
        <img src="http://192.168.49.240:8090/api/files/{collectionName}/{collectionID}/{fileName}" alt={fileName} class="aspect-square object-cover" />
    {:else}
        <Flex class="inset-0">
            <Icon src={Document} class="h-1/2 text-zinc-800/50" />
        </Flex>
    {/if}
</div>