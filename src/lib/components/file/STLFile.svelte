<script lang="ts">

    import { Canvas, DirectionalLight, OrbitControls, PerspectiveCamera, HemisphereLight, Mesh, T } from "@threlte/core";
    import { onMount } from "svelte";
    import { type BufferGeometry, MeshStandardMaterial, BoxGeometry, Box3, Vector3 } from "three";
    import type { OrbitControls as OrbitControlsThree } from "three/examples/jsm/controls/OrbitControls";

    import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

    export let url: string;

    let bufferGeometry: BufferGeometry | undefined = undefined;
    let mesh: THREE.Mesh | undefined = undefined;
    let box3: Box3 | undefined = undefined;
    let controls: OrbitControlsThree | undefined = undefined;

    let material = new MeshStandardMaterial({
        color: 0x333333,
        metalness: 0
    });

    onMount(async () => {
        const loader = new STLLoader();
        bufferGeometry = await loader.loadAsync(url);
    });

    $: if(mesh !== undefined) {
        mesh.geometry.computeBoundingBox();
        let vec: Vector3 = new Vector3();

        box3 = mesh.geometry.boundingBox!;
        box3.getCenter(vec);
        mesh.localToWorld( vec );

        controls?.target.set(vec.x, vec.y, vec.z);

        controls?.update();

    }

</script>

<Canvas>
    <PerspectiveCamera position={{ z: 100, y: 100, x: 100 }} lookAt={{ y: 0 }}>
        <OrbitControls bind:controls />
    </PerspectiveCamera>
    
    <DirectionalLight position={{ x: 50, y: 50, z: 50 }} />
    <HemisphereLight intensity={0.2} />

    {#if bufferGeometry}
        <Mesh receiveShadow {material} geometry={bufferGeometry} bind:mesh />
    {/if}

</Canvas>
