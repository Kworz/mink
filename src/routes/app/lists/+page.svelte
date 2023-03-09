<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import FormInput from "$lib/components/FormInput.svelte";
    import Flex from "$lib/components/layout/flex.svelte";

    import Table from "$lib/components/table/Table.svelte";
    import TableCell from "$lib/components/table/TableCell.svelte";
    import TableHead from "$lib/components/table/TableHead.svelte";
    import TableRow from "$lib/components/table/TableRow.svelte";
    import Wrapper from "$lib/components/Wrapper.svelte";
    import type { PageData } from "./$types";

    export let data: PageData;

    let addList = false;

</script>

<svelte:head><title>Nomenclaturize — Listes</title></svelte:head>

<Wrapper>
    <Flex justify="between" items="center">
        <h2>Listes</h2>
        <Button on:click={() => addList = !addList}>Créer une liste</Button>
    </Flex>

    <Table embeded={true}>
        <svelte:fragment slot="head">
            <TableHead>Liste</TableHead>
            <TableHead>Nomenclature de base</TableHead>
            <TableHead>Affaire</TableHead>
            <TableHead>Créé le</TableHead>
        </svelte:fragment>
    
        <svelte:fragment slot="body">

            {#if addList}
                <TableRow>
                    <TableCell>
                        <form id="createList" action="?/newList" method="POST" class="flex flex-col">
                            <FormInput form="createList" label="Nom de la liste" labelMandatory={true} name="name"/>
                        </form>
                    </TableCell>
                    <TableCell>
                        <FormInput form="createList" type="select" label="Nomenclature de base" labelMandatory={true} name="parent_nomenclature" value={data.nomenclatures.at(0)?.id}>
                            {#each data.nomenclatures as nomenclature}
                                <option value={nomenclature.id}>{nomenclature.name}</option>
                            {/each}
                        </FormInput>
                    </TableCell>
                    <TableCell>
                        <FormInput form="createList" type="select" label="Affaire" labelMandatory={true} name="project" value="">
                            <option value="">Aucun</option>
                            {#each data.projects as project}
                                <option value={project.id}>{project.name}</option>
                            {/each}
                        </FormInput>
                    </TableCell>
                    <TableCell><Button form="createList" class="self-end">Créer</Button></TableCell>
                </TableRow>
            {/if}


            {#each data.lists as list}
                <TableRow>
                    <TableCell><a href="/app/lists/{list.id}">{list.name}</a></TableCell>
                    <TableCell>
                        {#if list.expand?.parent_nomenclature !== undefined}
                            <a href="/app/nomenclatures/{list.expand.parent_nomenclature.id}">{list.expand.parent_nomenclature.name}</a>
                        {:else}
                            Aucune nomenclature parent
                        {/if}                
                    </TableCell>
                    <TableCell>
                        {#if list.expand?.project !== undefined}
                            <a href="/app/projects/{list.expand.project.id}">{list.expand.project.name}</a>
                        {:else}
                            Aucun
                        {/if}
                    </TableCell>
                    <TableCell>{list.created}</TableCell>
                </TableRow>
            {/each}
        </svelte:fragment>
    </Table>
</Wrapper>
