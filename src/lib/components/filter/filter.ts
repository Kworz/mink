export type FilterQueryResult<T extends string> = { 
    [K in T]: (string[] | string | undefined);
};

export function filterQuery<T extends string>(query: string, availableFilters: T[]): FilterQueryResult<T>
{
    const results: FilterQueryResult<T> = availableFilters.reduce((p, c) => { return { ...p, [c]: undefined } }, {} as FilterQueryResult<T>);
    const filterQueries = query.split(" && ");

    function appendResult(col: typeof availableFilters[number], value: string)
    {
        if(results[col] === undefined)
            results[col] = value;
        else if(typeof results[col] === "string")
            results[col] = [results[col] as string, value]
        else if(Array.isArray(results[col]))
            (results[col] as Array<string>).push(value);
    }

    for(const filter of filterQueries)
    {
        if(filter.length === 0)
            continue;

        if(availableFilters.includes("name" as T) && !filter.includes(":"))
        {
            appendResult("name" as T, filter);
            continue;
        }

        const splitted = filter.split(":");
        const filterName = splitted[0] as T;
        const filterValue = splitted[1];

        if(!availableFilters.includes(filterName as T))
            continue;

        appendResult(filterName, filterValue);
    }

    console.log("Filter results", results);

    return results;
}

export function filterCompatible(value: string, filter: string[] | string | undefined): boolean
{
    if(filter === undefined) return false;
    else if(typeof filter === "string") return value.toLowerCase().includes(filter.toLowerCase());
    else if(Array.isArray(filter)) return filter.map(k => value.toLowerCase().includes(k.toLowerCase())).reduce((p, c) => p || c, false);
    else return false;
}
