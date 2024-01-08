<script lang="ts">
    import Button from "$lib/components/generics/Button.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";

    let file: File | undefined = undefined;
    let columns: (string | null)[] = [];

    const availableColumns = ["Référence", "Désignation", "Fabricant"];

    const parseCSV = async (file: File): Promise<{ headers: string[], lines: string[][]}> => {

        const text = await file.text();

        const lines = text.split("\r\n");
        const headers = lines[0].split(",");

        const headersLength = headers.length;
        const linesArray = [];

        for(const line of lines.slice(1))
        {
            const lineArray = line.split(",");

            console.log(lineArray.length, lineArray);

            if(lineArray.length === headersLength)
                linesArray.push(lineArray);
            else if(lineArray.length > 0)
                linesArray.push([...lineArray, ...Array(headersLength - linesArray.length).fill("") as string[]].slice(0, headersLength));
        }

        columns = Array(headersLength).fill(null);

        return {
            headers,
            lines: linesArray
        }        
    }
</script>

<svelte:head>
    <title>Article — Import</title>
</svelte:head>

<h2>Importer des articles</h2>
<p>Importer des articles a l'aide d'un fichier CSV.</p>

<form action="?/import" method="post" class="mt-8" enctype='multipart/form-data'>
    <Flex direction="col" class="w-1/3">

        <input type="file" name="file" on:change={(e)=> {
            file = e.target.files.item(0);
        }} />

        <input type="hidden" name="columnOrder" value={JSON.stringify(columns)} />

        {#if file !== undefined}
            <Button class="self-start mb-6">Importer</Button>
        {/if}

    </Flex>
</form>

{#if file !== undefined}
    {#await parseCSV(file)}
        <p>Parsing CSV file</p>
    {:then parsed}
        <Table headers={parsed.headers.map(h => ({ label: h }))}>
            {#each parsed.headers as _, i}
                <TableCell>
                    <FormInput type="select" name="column#{i}" bind:value={columns[i]}>
                        <option value={null}>Ignorer</option>
                        {#each availableColumns.filter(ac => !(columns.filter((_, j) => i !== j).includes(ac))) as ac}
                            <option value={ac}>{ac}</option>
                        {/each}
                    </FormInput>
                </TableCell>
            {/each}

            {#each parsed.lines as line}
                {#each line as item}
                    <TableCell>{item}</TableCell>
                {/each}
            {/each}
        </Table>
    {/await}
{/if}