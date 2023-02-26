import type { PageServerLoad } from "./$types";
import { Collections, type ArticleResponse, type FabricationOrdersResponse, type ProjectsResponse } from "$lib/DBTypes";
import type { CalendarElementType } from "$lib/components/calendar/calendarTypes";

import { Temporal } from "@js-temporal/polyfill";

type FabricationOrdersResponseExpanded = FabricationOrdersResponse<{
    article: ArticleResponse
}>;

export const load = (async ({ locals }) => {

    const projects = await locals.pb.collection(Collections.Projects).getFullList<ProjectsResponse>();
    const fabricationOrders = await locals.pb.collection(Collections.FabricationOrders).getFullList<FabricationOrdersResponseExpanded>({ expand: 'article'});

    let calendarEvents: Array<CalendarElementType> = [];

    for(const project of projects)
    {
        calendarEvents.unshift({
            name: project.name,
            color: "bg-red-500",
            startDate: Temporal.Instant.from(project.start_date).toZonedDateTimeISO('UTC').toString(),
            endDate: Temporal.Instant.from(project.end_date).toZonedDateTimeISO('UTC').toString()
        });
    }

    for(const fo of fabricationOrders) {

        const event = {
            name: `${fo.expand?.article.name} — x${fo.quantity}`,
            color: "bg-amber-500",
            startDate: Temporal.Instant.from(fo.start_date).toZonedDateTimeISO('UTC').toString(),
            endDate: Temporal.Instant.from(fo.end_date).toZonedDateTimeISO('UTC').toString()
        };

        calendarEvents.unshift(event);
    }

    return {
        calendarEvents: structuredClone(calendarEvents)
    };

}) satisfies PageServerLoad;