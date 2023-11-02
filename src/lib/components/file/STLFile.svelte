<script lang="ts">

    import { T, useLoader, useThrelte, extend } from "@threlte/core";
    import { Align, Center, OrbitControls, interactivity } from "@threlte/extras";
    import { AmbientLight, Color, Vector3 } from "three";
    import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

    const loader = useLoader(STLLoader)
    const { renderer } = useThrelte();
    renderer.depthBuffer = true;
    interactivity();
    
    extend({
        OrbitControls
    })

    export let url: string;
    const obj = loader.load(url);

</script>

<T.PerspectiveCamera
  makeDefault
  position={[50, 50, 50]}
  fov={15}
>
    <OrbitControls autoRotate />
</T.PerspectiveCamera>

<T.DirectionalLight
  position.y={10}
  position.z={10}
/>

<T.AmbientLight />

<Align autoCenter>
  {#if $obj !== undefined}
      <T.Mesh geometry={$obj} castShadow receiveShadow>
          <T.MeshStandardMaterial color="0x666666" />
      </T.Mesh>
  {/if}
</Align>