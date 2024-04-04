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

/** Filter suggestion type */
export type FilterSuggestion = { 
    values: string[], 
    type?: "field" | "operands" | "value" 
};

export type PrismaFilter = {
    'OR'?: PropsPrismaFilter[],
    'AND'?: PropsPrismaFilter[],
    'NOT'?: PropsPrismaFilter,
}

/** Base prisma filter type */
export type PropsPrismaFilter = {
    [x: string]: PropsPrismaFilter | string | number | boolean | string[] | undefined,
    mode?: "insensitive"
}

export type PrismaFilterType = "AND" | "OR" | "NOT";

/**
 * Convert an unknown values with string type to a value with its inferred type
 * @param value value with unknown type
 * @returns value with its inferred type
 */
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

/**
 * Function used to validate if the operator is valid for the given value
 * @param filterValue value to check with
 * @param operattor operator to validate
 * @returns wether the operator is valid or not
 */
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
 * Validate if the filter value is valid for the given type
 * @param filterValue value to validate
 * @param expectedType expected type to match
 * @returns wether the value is valid or not
 */
function validateFilterValue(filterValue: any, expectedType: Filter["type"]): boolean
{
    if(expectedType === "string")
        return typeof filterValue === "string";
    else if(expectedType === "number")
        return typeof filterValue === "number";
    else if(expectedType === "boolean")
        return typeof filterValue === "boolean";
    else if(expectedType === "array")
        return filterValue instanceof Array;
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
export function appendFilter(filterQuery: string, filter: PrismaFilter, availableFilters: Array<Filter>, filterType: PrismaFilterType): PrismaFilter
{
    if(filterQuery.length === 0)
        throw "Filter length too small";

    const defaultFilter = availableFilters.find(k => k.default === true);
    const advancedFilterRegex = filterQuery.match(/([\w|.]*) (gt|lt|gte|lte|contains|not|equals|) (.*)/);

    if(advancedFilterRegex === null) /// Only a text is given
    {
        if(defaultFilter === undefined)
            throw "No default filter found";

        const filterValue = defaultFilter.type === "string" ? filterQuery : convertUnknownValue(filterQuery);

        if(filter[filterType] === undefined && ["OR", "AND"].includes(filterType))
            filter[filterType] = [];

        if(filter[filterType] !== undefined && ["OR", "AND"].includes(filterType))
            filter[filterType].push({ [defaultFilter.name]: { [(typeof filterValue === "string") ? "contains" : "equals"]: filterValue, mode: "insensitive" } });
        else
            filter[filterType] = { [defaultFilter.name]: { [(typeof filterValue === "string") ? "contains" : "equals"]: filterValue, mode: "insensitive" } };
    }
    else if(advancedFilterRegex.length === 4) /// Enough parts to create a filter
    {
        const field = advancedFilterRegex[1];
        const expectedType = availableFilters.find(k => k.name === field)?.type || "string";

        const filterValue = expectedType === "string" ? advancedFilterRegex[3] : convertUnknownValue(advancedFilterRegex[3]);
        let operator = advancedFilterRegex[2] as FilterCondition["operator"];

        if(!validateFilterValue(filterValue, expectedType))
            throw "Invalid filter value";

        if(filter[filterType] === undefined && ["OR", "AND"].includes(filterType))
            filter[filterType] = [];

        if(filter[filterType] !== undefined && ["OR", "AND"].includes(filterType))
            filter[filterType].push({ [field]: { [operator]: filterValue, mode: "insensitive" } });
        else
            filter[filterType] = { [field]: { [operator]: filterValue, mode: "insensitive" } };
    }
    else
        throw "no default filter found";

    return filter;
}

/**
 * Predict Fields filters based on users input
 * @param value current filter value
 * @param availableFilters filters given
 * @returns predictions based on the users input
 */
export function predictField(value: string, availableFilters: Array<Filter>): FilterSuggestion {

    if(value.length === 0)
        return { values: [] };

    const parts = value.split(" ");
    const part = parts.length - 1;

    if(part === 0)
    {
        const prefixes = availableFilters.filter(k => k.default !== true).map(k => k.name);
        return { values: prefixes.filter(k => k.toLowerCase().includes(parts[0].toLowerCase())).filter(k => k !== parts[0].toLowerCase()).sort((a, b) => a.indexOf(parts[0].toLowerCase()) - b.indexOf(parts[0].toLowerCase())), type: "field" };
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
        return { values: operators.length === 1 ? [] : operators, type: "operands" };
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
        
        return { values: returnValues, type: "value" };
    }
    else
        return { values: [] };
}