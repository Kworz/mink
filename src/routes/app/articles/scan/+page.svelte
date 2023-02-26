<script lang="ts">
    import { onMount } from "svelte";
    import jsQR, { type QRCode } from "jsqr";
    import { goto } from "$app/navigation";

    let videoSource: HTMLVideoElement;
    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D | null;

    let code: QRCode | null = null;

    onMount(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            videoSource.srcObject = stream;
            videoSource.play();
        } catch (error) {
            console.log(error);
        }
    });

    function analyzeFrame() {
        if(context !== null)
        {
            canvas.height = videoSource.videoHeight;
            canvas.width = videoSource.videoWidth;
            context.drawImage(videoSource, 0, 0, canvas.width, canvas.height);

            try {
                const image = context.getImageData(0, 0, canvas.width, canvas.height);
                code = jsQR(image.data, canvas.width, canvas.height);
                
                if(code !== null) {
                    goto(`/app/articles/${code.data}`);
                }
            }
            catch(ex)
            {
                console.log(ex);
            }

            requestAnimationFrame(analyzeFrame);
        }
    }

    $: if(canvas !== undefined) { context = canvas.getContext("2d"); }

</script>

<svelte:head><title>Article — Scan</title></svelte:head>

<video bind:this={videoSource} class=" rounded-md border border-zinc-500/50" on:play={() => requestAnimationFrame(analyzeFrame)} />
<canvas bind:this={canvas} class="hidden"/>
