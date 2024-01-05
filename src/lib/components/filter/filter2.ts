export type Filter = {
    name: string;
    default?: true;
    type?: "array" | "string" | "number" | "boolean";
}

export type FilterCondition = {
    field: string;
    hidden?: boolean;
} & (FilterConditionBoolean | FilterConditionString | FilterConditionNumber | FilterConditionArray);

type FilterConditionBoolean = {
    operator: 'equals' | 'not';
    value: boolean;
}

type FilterConditionNumber = {
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'not' | 'equals';
    value: number;
}

type FilterConditionString = {
    operator: 'contains' | 'not' | 'equals';
    value: string;
}

type FilterConditionArray = {
    operator: 'in' | 'notIn';
    value: string[];
}

function convertUnknownValue(value: string): string | number | boolean
{
    if(value === "true")
        return true;
    else if(value === "false")
        return false;
    else if(!isNaN(Number(value)))
        return Number(value);
    else
        return value;
}

function validateFilterOperator<T extends FilterCondition>(filterValue: T["value"], operator: T["operator"]): boolean
{
    if(typeof filterValue === "string")
        return ["contains", "not", "equals"].includes(operator);
    else if(typeof filterValue === "number")
        return ["gt", "lt", "gte", "lte", "not", "equals"].includes(operator);
    else if(typeof filterValue === "boolean")
        return ["not", "equals"].includes(operator);
    else
        return false;
}
/**
 * Append a new text filter to the filter
 * @param filterQuery Text based syntax filter `field operator value`
 * @param filter filter already present
 * @param availableFilters avaialble filters we can rely on
 * @returns The modified filter
 */
export function appendFilter(filterQuery: string, filter: PrismaFilter, availableFilters: Array<Filter>): PrismaFilter
{
    if(filterQuery.length === 0)
        throw "Filter length too small";

    const defaultFilter = availableFilters.find(k => k.default === true);
    const regexMatches = filterQuery.match(/([\w|.]*) (\w*) (.*)/);

    if(regexMatches === null) /// Only a text is given
    {
        if(defaultFilter === undefined)
            throw "No default filter found";

        const filterValue = defaultFilter.type === "string" ? filterQuery : convertUnknownValue(filterQuery);

        if(filter[defaultFilter.name])
            filter[defaultFilter.name] = { ...filter[defaultFilter.name] as Object, [(typeof filterValue === "string") ? "contains" : "equals"]: filterValue } as PrismaFilter;
        else
            filter[defaultFilter.name] = { [defaultFilter.type === "string" ? "contains" : "equals"]: filterValue };

    }
    else if(regexMatches.length === 4) /// Enough parts to create a filter
    {
        const field = regexMatches[1];
        const isFilterString = availableFilters.find(k => k.name === field)?.type === "string";

        const filterValue = isFilterString ? regexMatches[3] : convertUnknownValue(regexMatches[3]);
        const operator = regexMatches[2] as FilterCondition["operator"];

        if(validateFilterOperator(filterValue, operator))
            if(filter[field] === undefined)
                filter[field] = { [operator]: filterValue };
            else
                filter[field] = { ...filter[field] as Object, [operator]: filterValue } as PrismaFilter;
        else
            throw "Invalid filter operator";
    }
    else
        throw "no default filter found";

    return filter;
}

export function convertFilterCondition(value:  string , availableFilters: Array<Filter>): FilterCondition
{
    if(value.length === 0)
        throw "Filter length too small";

    const defaultFilter = availableFilters.find(k => k.default === true);
    const regexMatches = value.match(/([\w|.]*) (\w*) (.*)/);

    if(regexMatches === null)
    {
        if(defaultFilter === undefined)
            throw "No default filter found";

        const filterValue = defaultFilter.type === "string" ? value : convertUnknownValue(value);

        if(typeof filterValue === "string")
            return { field: defaultFilter.name, value: filterValue, operator: "contains" };
        else if(typeof filterValue === "number")
            return { field: defaultFilter.name, value: filterValue, operator: "equals" };
        else if(typeof filterValue === "boolean")
            return { field: defaultFilter.name, value: filterValue, operator: "equals" };
        else
            throw "Invalid filter value"
    }
    else if(regexMatches.length === 4)
    {
        const field = regexMatches[1];
        const isFilterString = availableFilters.find(k => k.name === field)?.type === "string";

        const filterValue = isFilterString ? regexMatches[3] : convertUnknownValue(regexMatches[3]);
        const operator = regexMatches[2] as FilterCondition["operator"];

        if(typeof filterValue === "string" && validateFilterOperator(filterValue, operator))
            return { field, value: filterValue, operator: operator as FilterConditionString["operator"] };
        else if(typeof filterValue === "number" && validateFilterOperator(filterValue, operator))
            return { field, value: filterValue, operator: operator as FilterConditionNumber["operator"] };
        else if(typeof filterValue === "boolean" && validateFilterOperator(filterValue, operator))
            return { field, value: filterValue, operator: operator as FilterConditionBoolean["operator"] };
        else
            throw "Invalid filter value"
    }
    else
        throw "no default filter found";
}

/**
 * Predict Fields filters based on value typed
 * @param value 
 * @param availableFilters 
 * @returns 
 */
export function predictField(value: string, availableFilters: Array<Filter>): string[] {

    if(value.length === 0)
        return [];

    const parts = value.split(" ");
    const part = parts.length - 1;

    if(part === 0)
    {
        const prefixes = availableFilters.filter(k => k.default !== true).map(k => k.name);
        return prefixes.filter(k => k.toLowerCase().includes(parts[0].toLowerCase())).filter(k => k !== parts[0].toLowerCase()).sort((a, b) => a.indexOf(parts[0].toLowerCase()) - b.indexOf(parts[0].toLowerCase()));
    }
    else if (part === 1)
    {
        const filterType = availableFilters.find(k => k.name === parts[0])?.type;
        const reccomendedOperatorsForType: Record<Exclude<Filter["type"], undefined>, string[]> = {
            "array": ["in", "notIn"],
            "string": ["equals", "not", "contains"],
            "number": ["equals", "not", "gt", "lt", "lte", "gte"],
            "boolean": ["equals", "not"]
        };

        const operators = ((filterType !== undefined) ? reccomendedOperatorsForType[filterType] : ['equals', 'not', 'gt', 'lt', 'gte', 'lte', 'in', 'notIn', 'contains']).filter(k => k.includes(parts[1]));
        return operators.length === 1 ? [] : operators;
    }
    else if (part === 2)
    {
        const returnValues: Array<string> = [];

        const currentFilterType = availableFilters.find(k => k.name === parts[0])?.type;
        returnValues.push(...availableFilters.filter(k => k.type === currentFilterType && k.name != parts[0]).map(k => k.name));

        switch(currentFilterType)
        {
            case "boolean":
            {
                returnValues.push(...["true", "false"]);
                break;
            }

            default: break;
        }
        
        return returnValues;
    }
    else
        return [];
}

export type PrismaFilter = {
    [x: string]: PrismaFilter | string | number | boolean | string[] | undefined
}

export function converToPrismaFilter(filters: Array<FilterCondition>): string
{
    if(filters.length === 0)
        return "";

    const finalFilter: PrismaFilter = {};

    // loop through filters
    // append to final filter
    // merge keys with . on parent keys to create nested objects

    for(const filter of filters)
    {
        const parts = filter.field.split(".");

        if(parts.length === 1)
        {
            if(finalFilter[filter.field] === undefined)
            {
                finalFilter[filter.field] = {
                    [filter.operator]: filter.value
                }
            }
        }
        else
        {
            if(finalFilter[parts[0]] === undefined)
                finalFilter[parts[0]] = {};

            // generate nested object when filter parts is more than 1
            let nestedObject = finalFilter[parts[0]];

            if(nestedObject instanceof Object && !(nestedObject instanceof Array))
            {
                for(let i = 1; i < parts.length - 1; i++)
                {
                    if(nestedObject[parts[i]] === undefined)
                        nestedObject[parts[i]] = {}
    
                    nestedObject = nestedObject[parts[i]];
                }
    
                nestedObject[parts[parts.length - 1]] = {
                    [filter.operator]: filter.value
                }
            }
        }
    }

    return JSON.stringify(finalFilter);
}