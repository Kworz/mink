<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";
import PillMenu from "$lib/components/PillMenu/PillMenu.svelte";
    import PillMenuButton from "$lib/components/PillMenu/PillMenuButton.svelte";
    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import { Collections, type AssembliesRecord, type AssembliesResponse } from "$lib/DBTypes";
    import { PlusCircle, Star } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { Collection } from "pocketbase";
    import { create } from "qrcode";
    import type { PageData } from "./$types";

    export let data: PageData;

    let createAssembly = false;

    let createAssemblyName = "";
    let createAssemblyDesc = "";

    const createAssemblyFn = async () => {
        if(createAssemblyName === "")
            return;
        
        if(createAssemblyDesc === "")
            return;

        const assembly = {

            name: createAssemblyName,
            description: createAssemblyDesc,

        } satisfies AssembliesRecord;
        
        const createdAssembly = await $page.data.pb?.collection(Collections.Assemblies).create<AssembliesResponse>(assembly);

        goto(`/app/assemblies/${createdAssembly.id}`);
    }

</script>

<Wrapper>
    <h3>Liste des assemblages</h3>

    <PillMenu>
        <PillMenuButton icon={PlusCircle} on:click={() => createAssembly = !createAssembly}>Créer un assemblage</PillMenuButton>
    </PillMenu>

    <Table embeded={true}>
        <svelte:fragment slot="head">
            <TableHead colWidth="w-12"></TableHead>
            <TableHead>Nom de l'assemblage</TableHead>
            <TableHead colWidth="w-2/3">Description</TableHead>
        </svelte:fragment>

        <svelte:fragment slot="body">

            {#if createAssembly}
                <TableRow>
                    <TableCell></TableCell>
                    <TableCell>
                        <FormInput name="" label="Nom" labelMandatory bind:value={createAssemblyName} />
                    </TableCell>
                    <TableCell>
                        <Flex items="end" class="w-full">
                            <FormInput name="" label="Description" labelMandatory bind:value={createAssemblyDesc} class="grow" />
                            <Button on:click={createAssemblyFn}>Créer</Button>
                        </Flex>
                    </TableCell>
                </TableRow>
            {/if}

            {#each data.assemblies as assembly}
                <TableRow>
                    <TableCell><Icon src={Star} theme={assembly.favorite ? "solid" : ""} class="h-6 w-6 text-violet-500" /></TableCell>
                    <TableCell><a href="/app/assemblies/{assembly.id}">{assembly.name}</a></TableCell>
                    <TableCell>{assembly.description}</TableCell>
                </TableRow>
            {/each}
        </svelte:fragment>
    </Table>
</Wrapper>