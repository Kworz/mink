import { getContext, setContext } from "svelte";
import { writable, type Writable } from "svelte/store";

type MenuContext = {
    isShrinked: Writable<boolean>
}

export const menuShrinked = writable<boolean>(true);
export const menuRightShrinked = writable<boolean>(false);

export const setMenuContext = () => setContext<MenuContext>("menu", {

    isShrinked: menuShrinked

});

export const getMenuContext = () => getContext<MenuContext>("menu");