export const articleUnits: Record<string, [string, string, string]> = {
    default: ["u", "Unité", "Unités"],
    kg: ["kg", "Kilogramme", "Kilogrammes"],
    g: ["g", "Gramme", "Grammes"],
    l: ["L", "Litre", "Litres"],
    m: ["M", "Mètre", "Mètres"],
    ml: ["ML", "Mètre linéaire", "Mètres linéaire"],
    bu: ["B - # u", "Boite de #", "Boites de #"],
    bl: ["B - # l", "Bouteille de # litres", "Bouteilles de # litres"],
    bml: ["B - # ml", "Bouteille de # millilitres", "Bouteilles de # millilitres"],
    bg: ["B - # g", "Bouteille de # grammes", "Bouteilles de # grammes"],
};

//type units = "default" | "kg" | "g" | "l" | "m" | "ml" | "bu" | "bl" | "bml" | "bg";

export const returnArticleUnit = (unit?: string, unit_qty = 1, qty = 0, short = false) => {

    if(unit === undefined || unit === "" || articleUnits[unit] === undefined)
        return `${qty} ${short ? articleUnits.default[0] : (qty > 0) ? articleUnits.default[2] : articleUnits.default[1]}`

    const unitUsed = (short === true) ? articleUnits[unit][0] : (qty > 1  ? articleUnits[unit][1] : articleUnits[unit][2]); 
    
    return `${unit.startsWith("b") ? (qty / (unit_qty ?? 1)) : qty} ${unitUsed.replace("#", unit_qty?.toString() ?? "")}`;
}