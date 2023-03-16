import type { NomenclatureResponseExpanded, NomenclatureRowResponseExpanded } from "../../../../routes/app/nomenclatures/[id]/+page.server";

export type NomenclatureNestGroup = {
    name: string;
    items: Array<{
        nomenclature_row: NomenclatureRowResponseExpanded,
        quantity: number
    }>;
    subGroups: Array<NomenclatureNestGroup>;
};

/**
 * Generate Nomenclature Nest Group
 * @param groups All the nomenclature groups
 * @param nomenclatureRows All nomenclature rows
 * @param parentGroup Parent group to generate sub childrens for
 * @param level nesting current level
 * @returns Nest children subgroup
 */
const nestChildrens = (groups: string[][], nomenclatureRows: NomenclatureRowResponseExpanded[], parentGroup: string | undefined, level = 1): Array<NomenclatureNestGroup> =>
{
    const childGroups = groups.filter(g => g.length === level && (parentGroup !== undefined ? g.join(".").includes(parentGroup) : true));
                        
    return childGroups.map(childGroup => {

        const joinedGroupName = childGroup.join(".");

        return {
            name: joinedGroupName,
            items: nomenclatureRows.filter(nr => nr.group?.split(",").map(g => g.split(":")[0]).includes(joinedGroupName)).map(nr => {
                
                const quantity = Number(nr.group?.split(",").find(g2 => g2.includes(joinedGroupName))?.split(":")[1] ?? nr.quantity_required);

                return {
                    nomenclature_row: nr,
                    quantity
                }
            }),

            subGroups: nestChildrens(groups, nomenclatureRows, joinedGroupName, level + 1)
        }
    });
}

/**
 * Creates a nested nomenclature from a flat nomenclature
 * @param nomenclature Nomenclature to be nested
 * @returns Nested nomenclature
 */
export const computeNested = (nomenclature: NomenclatureResponseExpanded): Array<NomenclatureNestGroup> => {

    if(nomenclature.expand?.["nomenclature_row(parent_nomenclature)"] === undefined)
        throw "Nomenclature row is not expanded";

    let groups = nomenclature.expand["nomenclature_row(parent_nomenclature)"].flatMap(nr => ((nr.group ?? "").split(",") ?? []).map(g => g.split(":")[0].split(".")));
    const flattedGroups = groups?.map(g => g.join("."));

    groups = groups?.filter((g, i) => flattedGroups?.indexOf(g.join(".")) === i);


    function makeNestedParent(group: string[]) {
        
        const parentGroup = group.filter((k, i) => i < group.length - 1);

        if(parentGroup.length === 0)
            return;

        const parentGroupItem = groups?.find(g => g.join("") === parentGroup.join(""));
        const hasParent = parentGroupItem?.length !== 0 && parentGroupItem !== undefined;
        
        if(hasParent === false)
            groups?.push(parentGroup);
    }
    
    groups?.forEach(makeNestedParent);
    groups = groups?.sort((a, b) => a.join("").localeCompare(b.join("")));

    return nestChildrens(groups, nomenclature.expand["nomenclature_row(parent_nomenclature)"], undefined);
}