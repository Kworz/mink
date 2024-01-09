import { getContext, setContext } from "svelte";
import type { Action } from "svelte/action";
import { writable, type Writable } from "svelte/store";

type PillMenuContext = {
    open: Writable<boolean>
}

export const setPillMenuContext = () => setContext<PillMenuContext>("pillMenu", {
    open: writable<boolean>(false)
});

export const getPillMenuContext = () => getContext<PillMenuContext>("pillMenu");

/** Dispatch event on click outside of node */
export const clickOutside = ((node: HTMLDivElement) => {

    const handleClick = () => {
        node.dispatchEvent(new CustomEvent('click_outside'))
    }

    document.addEventListener('click', handleClick, true);

    return { 
        destroy() { document.removeEventListener('click', handleClick, true); }
    }

}) satisfies Action<HTMLDivElement, {}, { "on:click_outside": (e: CustomEvent<string>) => void}>;