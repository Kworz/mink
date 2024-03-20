import { enhance, applyAction } from "$app/forms";

/** Enhance form function that triggers other routes actions */
export function enhanceApply(form: HTMLFormElement)
{
    return enhance(form, () => { return ({ result }) => applyAction(result)})
}