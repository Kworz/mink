import { getContext, setContext } from "svelte";
import { type Writable, writable } from "svelte/store";

import type { CalendarElementType } from "./calendarTypes";

type CalendarContext = {
    currentMonth: Writable<number>,
    currentYear: Writable<number>,
    calendarEvents: Writable<Array<CalendarElementType>>,
}

export const getCalendarContext = () => getContext<CalendarContext>("calendarContext");

export const setCalendarContext = (initialMonth: number, initialYear: number, events: Array<CalendarElementType>) => setContext<CalendarContext>("calendarContext", {
    currentMonth: writable<number>(initialMonth),
    currentYear: writable<number>(initialYear),
    calendarEvents: writable<Array<CalendarElementType>>(events)
});