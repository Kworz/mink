import { resolve } from "path";
import { writeFile, unlink } from "fs/promises";
import { existsSync, mkdirSync } from "fs";

/**
 * Uploads a file to the server file storage
 * @param path path to save the file to
 * @param file file to save
 * @returns final relative path of the file
 */
export async function saveFile(path: string, file: Blob): Promise<string | undefined>
{
    if(file.size === 0)
        return undefined;

    const fileExtension = file.name.split(".").pop();
    
    if(fileExtension === undefined)
        throw "unable to find file extension";

    const fileName = `${crypto.randomUUID()}.${fileExtension}`;

    const folderPath = resolve(process.cwd(), 'static', 'uploads', path);

    if(existsSync(folderPath) === false)
        mkdirSync(folderPath, { recursive: true });
    
    const writePath = resolve(process.cwd(), 'static', 'uploads', path, fileName);    
    await writeFile(writePath, Buffer.from(await file.arrayBuffer()));

    return resolve("/uploads", path, fileName);
}

/**
 * Removes a file from the server file storage
 * @param path file path to remove
 */
export async function deleteFile(path: string) {

    await unlink(resolve(process.cwd(), "static", path.substring(1)));
}