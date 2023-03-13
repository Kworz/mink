import { getContext, setContext } from "svelte";
import { writable, type Writable } from "svelte/store";

type MenuContext = {
    isShrinked: Writable<boolean>
}

export const setMenuContext = () => setContext<MenuContext>("menu", {

    isShrinked: writable<boolean>(true)

});

export const getMenuContext = () => getContext<MenuContext>("menu");