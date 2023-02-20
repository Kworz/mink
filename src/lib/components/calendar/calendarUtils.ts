import { Temporal } from "@js-temporal/polyfill";

export function getCalendarLayout(month: number, year: number): Array<Temporal.PlainDate> {

    const result = Array.from(Array(35));

    let date = Temporal.PlainDate.from({ year, month, day: 1 });
    date = date.subtract({ days: date.dayOfWeek });
    
    for(let i = 0; i < 35; i++)
    {
        date = date.add({days: 1});
        result[i] = date;
    }

    return result as Array<Temporal.PlainDate>
}