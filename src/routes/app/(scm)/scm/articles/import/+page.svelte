<script lang="ts">
    import Button from "$lib/components/generics/Button.svelte";
    import FormInput from "$lib/components/generics/inputs/FormInput.svelte";
    import Flex from "$lib/components/generics/layout/flex.svelte";
    import Table from "$lib/components/generics/table/Table.svelte";
    import TableCell from "$lib/components/generics/table/TableCell.svelte";
    import { _ } from "svelte-i18n";
    import type { ActionData } from "./$types";
    import Modal from "$lib/components/generics/modal/Modal.svelte";

    export let form: ActionData;

    let file: File | undefined = undefined;
    let columns: (string | null)[] = [];

    let splitter: "," | ";" = ",";
    let rowSplitter: "n" | "rn" = "n";

    let importSuspense = false;

    const availableColumns = ["sku", "name", "brand", "non_physical", "consumable", "internal", "unit_of_work", "unit_of_work_quantity", "order_quantity", "critical_quantity"];

    const parseCSV = async (file: File, splitter: "," | ";" = ",", lineSplitter: "n" | "rn" = "n"): Promise<{ headers: string[], lines: string[][]}> => {

        const text = await file.text();

        const lineSplitterRegex = lineSplitter === "n" ? /\n/ : /\r\n/;

        const lines = text.split(lineSplitterRegex);
        const headers = lines[0].split(splitter); // field splitter

        const headersLength = headers.length;
        const linesArray = [];

        for(const line of lines.slice(1))
        {
            const lineArray = line.split(splitter); // field splitter

            if(lineArray.length === headersLength)
                linesArray.push(lineArray);
            else if(lineArray.length > headersLength) // trim excess columns
                linesArray.push(lineArray.slice(0, headersLength));
            else if(lineArray.length < headersLength) // add null values underfilled columns
                linesArray.push([...lineArray, ...Array(headersLength - lineArray.length).fill("") as string[]]);

        }

        columns = Array(headersLength).fill("");

        return {
            headers,
            lines: linesArray
        }        
    }

</script>

<svelte:head>
    <title>Article — Import</title>
</svelte:head>

{#if form?.import !== undefined && "error" in form.import}
    <Modal title={$_('app.generic.error')} on:close={() => form = null}>
        <p>{$_(form.import.error)}</p>
    </Modal>
{/if}

{#if form?.import !== undefined && "warnings" in form.import}
    <Modal title={$_('app.generic.warning')} on:close={() => form = null}>
        <ul>
            {#each form.import.warnings as warning}
                <li>{warning}</li>
            {/each}
        </ul>
        <div slot="form">
            <Button size="small" role="warning">{$_('app.action.validate')}</Button>
        </div>
    </Modal>
{/if}

<h2>Importer des articles</h2>
<p>Importer des articles a l'aide d'un fichier CSV.</p>

<form action="?/import" method="post" class="mt-8" enctype='multipart/form-data' on:submit={() => importSuspense = true}>
    <Flex direction="col" class="w-1/3">

        <FormInput type="select" name="col_splitter" label="Séparateur de champs" values={[",", ";"]} bind:value={splitter}>
            <option value=",">Virgule</option>
            <option value=";">Point-virgule</option>
        </FormInput>

        <FormInput type="select" name="row_splitter" label="Séparateur de lignes" values={["n", "rn"]} bind:value={rowSplitter}>
            <option value="n">Saut de ligne (\n)</option>
            <option value="rn">Windows CRLF (\r\n)</option>
        </FormInput>

        <input type="file" name="file" on:change={(e)=> {
            file = e.target?.files.item(0);
        }} />

        <input type="hidden" name="column_order" value={JSON.stringify(columns)} />

        {#if file !== undefined}
            <Button class="self-start mb-6" suspense={importSuspense}>Importer</Button>
        {/if}
    </Flex>
</form>

{#if file !== undefined}
    {#await parseCSV(file, splitter)}
        <p>Parsing CSV file...</p>
    {:then parsed}
        <Table headers={parsed.headers.map(h => ({ label: h }))}>
            {#each parsed.headers as header, i (header)}
                <TableCell>
                    <FormInput type="select" label="Colone correspondante" name="header-selector-{i}" bind:value={columns[i]}>
                        <option value={""}>Ignorer</option>

                        {#each availableColumns as ac}
                            <option value={ac} disabled={columns.includes(ac)}>{$_('app.generic.' + ac)}</option>
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