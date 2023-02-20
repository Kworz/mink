import { enhance } from "$app/forms";

/** Enhance form function that do not clear form after completion */
export function enhanceNoReset(form: HTMLFormElement)
{
    return enhance(form, () => { return ({update}) => update({reset: false})})
}