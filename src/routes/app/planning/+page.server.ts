import type { PageServerLoad } from "./$types";
import { Collections, type ProjectsResponse } from "$lib/DBTypes";
import type { CalendarElementType } from "$lib/components/calendar/calendarTypes";

import { Temporal } from "@js-temporal/polyfill";

export const load = (async ({ locals }) => {

    const projects = await locals.pb.collection(Collections.Projects).getFullList<ProjectsResponse>();

    const calendarEvents: Array<CalendarElementType> = [];

    for(const project of projects)
    {
        calendarEvents.push({
            name: project.name,
            color: "bg-red-500",
            startDate: Temporal.Instant.from(project.start_date).toZonedDateTimeISO('UTC').toString(),
            endDate: Temporal.Instant.from(project.end_date).toZonedDateTimeISO('UTC').toString()
        })
    }

    return {
        calendarEvents: structuredClone(calendarEvents)
    };

}) satisfies PageServerLoad;