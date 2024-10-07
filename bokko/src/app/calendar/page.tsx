"use client"

import CalendarComponent from "@/components/ui/calendar"

export default function Calendar() {
    const curDate = new Date();

    return (
        <CalendarComponent
            curDate={curDate}
        />
    )
}