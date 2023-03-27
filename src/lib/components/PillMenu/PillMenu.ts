import { getContext, setContext } from "svelte";
import { writable, type Writable } from "svelte/store";

type PillMenuContext = {
    open: Writable<boolean>
}

export const setPillMenuContext = () => setContext<PillMenuContext>("pillMenu", {
    open: writable<boolean>(false)
});

export const getPillMenuContext = () => getContext<PillMenuContext>("pillMenu");

/** Dispatch event on click outside of node */
export function clickOutside(node: HTMLElement) {

    console.log(this);
  
    const handleClick = (event: MouseEvent) => {
      if (node && !node.contains(event.target) && !event.defaultPrevented)
      {
        node.dispatchEvent(
          new CustomEvent('click_outside', node)
        )
      }
    }
  
    document.addEventListener('click', handleClick, true);
    
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
      }
  }