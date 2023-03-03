<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import jsQR, { type QRCode } from "jsqr";
    import { goto } from "$app/navigation";

    let videoSource: HTMLVideoElement;
    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D | null;

    let code: QRCode | null = null;
    let stream: MediaStream | undefined;

    const prefixes = {
        "list": "lists"
    }

    onMount(async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            videoSource.srcObject = stream;
            videoSource.play();
        } catch (error) {
            console.log(error);
        }
    });

    onDestroy(() => {
        stream?.getTracks().forEach(t => {
            t.stop();
        })
    });

    function analyzeFrame()
    {
        if(context !== null)
        {
            canvas.height = videoSource.videoHeight;
            canvas.width = videoSource.videoWidth;
            context.drawImage(videoSource, 0, 0, canvas.width, canvas.height);

            try {
                const image = context.getImageData(0, 0, canvas.width, canvas.height);
                code = jsQR(image.data, canvas.width, canvas.height);
                
                if(code !== null)
                {
                    const split = code.data.split(':');
                    if(split.length > 1)
                    {
                        const part = prefixes[split.at(0)];
                        const part2 = split.at(1);
                        goto(`/app/${part}/${part2}`);
                    }
                    else
                        goto(`/app/articles/${code.data}`);
                }
            }
            catch(ex)
            {
                console.log(ex);
            }

            requestAnimationFrame(analyzeFrame);
        }
        else
        {
            return;
        }
    }

    $: if(canvas !== undefined) { context = canvas.getContext("2d", { willReadFrequently: true }); }

</script>

<svelte:head><title>Article — Scan</title></svelte:head>

<video bind:this={videoSource} class=" rounded-md border border-zinc-500/50" on:play={() => requestAnimationFrame(analyzeFrame)} />
<canvas bind:this={canvas} class="hidden"/>
