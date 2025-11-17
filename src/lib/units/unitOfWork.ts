import type { scm_articleWithIncludes } from "$lib/components/derived/article/article";
import { unit_of_work } from "$lib/prisma-enums/index.js";

export function unitOfWork(article: scm_articleWithIncludes): { step: number, min: number } {

    const isUnitFloating = [
        unit_of_work.millimeter,
        unit_of_work.centimeter,
        unit_of_work.meter,
        unit_of_work.centiliter,
        unit_of_work.liter,
        unit_of_work.gram,
        unit_of_work.kilogram,
        unit_of_work.milliliter,
    ].includes(article.unit);

    const step = isUnitFloating ? 0.01 : 1;

    return {
        step,
        min: step
    }

}