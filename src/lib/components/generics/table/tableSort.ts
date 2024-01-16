/** Object used by table to keep sorted elements */
export type TableSort = { name: string, direction: "asc" | "desc"};

/**
 * Converts a TableSort array to a Prisma orderBy Object Base64 encoded string
 * @param sorts Array of sorts rules
 * @returns A JSON Stringified Object Base64 encoded string
 */
export const convertTableSortToPrismaSort = (sorts: Array<TableSort>): {} => {
    return sorts.reduce((p, c) => ({...p, [c.name]: c.direction}), {});
}