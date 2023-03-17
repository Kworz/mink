import type { AssembliesResponse } from "$lib/DBTypes";
import { getContext, setContext } from "svelte";
import { writable, type Writable } from "svelte/store";

type AssemblyContext = {
    selectedAssembly: Writable<AssembliesResponse | undefined>
}

export const getAssemblyContext = () => getContext<AssemblyContext>("assembly");

export const setAssemblyContext = (selectedAssembly: AssembliesResponse) => setContext<AssemblyContext>("assembly", {
    selectedAssembly: writable<AssembliesResponse | undefined>(selectedAssembly)
});