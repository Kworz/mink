export type Filter = {
    name: string;
    default?: true;
    shorthands?: string[];
}

export type FilterCondition = {
    field: string;
    value: string;
}

export function convertFilterCondition(value: string, availableFilters: Array<Filter>): FilterCondition
{
    const defaultFilter = availableFilters.find(k => k.default === true);

    const filterParts = value.split(":");

    if(filterParts.length === 1 && defaultFilter !== undefined)
        return { field: defaultFilter.name, value: convertFilterValue(filterParts[0]) };
    
    if(filterParts.length !== 2)
        throw "Invalid filter";

    const filterName = validateFilterField(availableFilters, filterParts[0]);

    return {
        field: filterName,
        value: convertFilterValue(filterParts[1])
    }
}

function validateFilterField(availableFilters: Array<Filter>, possibleField: string): string {
    for(const filter of availableFilters)
    {
        if(filter.name === possibleField)
            return filter.name;
        if(filter.shorthands?.includes(possibleField))
            return filter.name;
    }

    throw `${possibleField} is neither a filter or a shorthand.`;
}

/**
 * Predict Fields filters based on value typed
 * @param value 
 * @param availableFilters 
 * @returns 
 */
export function predictField(value: string, availableFilters: Array<Filter>): string[] {

    if(value.indexOf(":") > -1 || value.length === 0)
        return [];

    const prefixes = availableFilters.filter(k => k.default !== true).map(k => k.name);
    return prefixes.filter(k => k.toLowerCase().includes(value)).filter(k => k !== value).sort((a, b) => a.indexOf(value) - b.indexOf(value));
}

function convertFilterValue(value: string): string {

    if(value === "true" || value === "false")
        return value;
    
    return `"${value}"`;
}

export function convertToPocketbaseFilter(filters: Array<FilterCondition>): string
{
    return encodeURIComponent(filters.map(k => `${k.field} ~ ${k.value}`).join(" && "));
}