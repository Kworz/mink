<script lang="ts">
    import { browser } from "$app/environment";
    import { invalidateAll } from "$app/navigation";
import { setAssemblyContext } from "$lib/components/assemblies/assemblyContext";
    import AssemblyEditor from "$lib/components/assemblies/AssemblyEditor.svelte";
    import AssemblyFlat from "$lib/components/assemblies/AssemblyFlat.svelte";
    import AssemblyTree from "$lib/components/assemblies/AssemblyTree.svelte";
    import Button from "$lib/components/Button.svelte";
    import DetailLabel from "$lib/components/DetailLabel.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
    import Grid from "$lib/components/layout/grid.svelte";
    import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import Wrapper2 from "$lib/components/Wrapper2.svelte";
    import { enhanceNoReset } from "$lib/enhanceNoReset";
    import { DocumentCheck, WrenchScrewdriver } from "@steeze-ui/heroicons";
    import type { ActionData, PageData, Snapshot } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    let mode: "nested" | "flat" = "nested";
    let editAssembly = false;
    let editAssemblyDeleteThumbnail = false; 

    setAssemblyContext(data.assembly);

    export const snapshot: Snapshot<"nested" | "flat"> = {
        capture: () => mode,
        restore: (value) => mode = value
    }

    $: if(form !== null) { invalidateAll(); editAssembly = false; editAssemblyDeleteThumbnail = false; };

</script>

<Flex gap={6} items="start">

    {#if data.assembly.thumbnail && browser}
        <img src="http://{window.location.hostname}:8090/api/files/{data.assembly.collectionName}/{data.assembly.id}/{data.assembly.thumbnail}?thumb=200x200" alt={data.assembly.thumbnail} class="aspect-square object-cover rounded-lg border border-zinc-500/50 w-48" />
    {/if}
    <Wrapper class="grow">
        <h3>Visualisation de l'assemblage {data.assembly.name}.</h3>
    
        {#if editAssembly}
            <form action="?/editAssembly" method="post" use:enhanceNoReset class="flex flex-col gap-4 mt-6">
            
                <FormInput name="name" label="Nom de l'assemblage" value={data.assembly.name} labelMandatory />
                <FormInput name="description" label="Description" value={data.assembly.description} />
                <FormInput type="number" name="assembly_time" label="Durée de montage (heures)" min={0} step={0.25} value={data.assembly.assembly_time} />
    
                {#if data.assembly.thumbnail !== ""}
                    <Button on:click={() => editAssemblyDeleteThumbnail = !editAssemblyDeleteThumbnail} role={editAssemblyDeleteThumbnail ? "warning" : "danger"} class="self-start">{editAssemblyDeleteThumbnail ? "Anuller le retrait" : "Retirer la miniature"}</Button>
                    {#if editAssemblyDeleteThumbnail}
                        <input type="hidden" value="" name="thumbnail" />
                    {/if}
                {:else}
                    <FormInput type="file" name="thumbnail" label="Miniature" />
                {/if}
    
                <Flex>
                    <Button>Valider les modifications</Button>
                    <Button role="warning" on:click={() => editAssembly = false}>Anuller</Button>
                </Flex>
            
            </form>
        
        {:else}
    
            {#if data.assembly.description} <p>{data.assembly.description}</p> {/if}
        
            {#if data.assembly.assembly_time != 0}
                <p>Durée d'assemblage: <DetailLabel>{data.assembly.assembly_time} Heures</DetailLabel>.</p>
            {/if}
        {/if}
    
    
        <PillMenu>
            <PillMenuButton icon={DocumentCheck} on:click={() => mode = (mode === "nested") ? "flat" : "nested"}>{mode === "nested" ? "Vue applanie" : "Vue imbriquée"}</PillMenuButton>
            <PillMenuButton icon={WrenchScrewdriver} on:click={() => editAssembly = !editAssembly}>Modifier l'assemblage</PillMenuButton>
        </PillMenu>
    </Wrapper>
</Flex>



{#if mode === "nested"}
    <Flex gap={6} class="mt-6" items="start">

        <Wrapper2 class="w-fit shrink-0">
            {#key data.assembly.id}
                <AssemblyTree bind:assembly={data.assembly} />
            {/key}
        </Wrapper2>
    
        <AssemblyEditor />
    </Flex>
{:else}
    <AssemblyFlat bind:assembly={data.assembly} />
{/if}

