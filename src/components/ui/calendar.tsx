"use client"

import * as React from "react"
import { DayPicker, type DayPickerSingleProps } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"

export type CalendarProps = DayPickerSingleProps

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={id}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-foreground",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 inline-flex items-center justify-center rounded-md transition-opacity"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] uppercase",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-lg",
          "hover:bg-primary/10 hover:scale-105 hover:shadow-[0_2px_8px_rgba(0,0,255,0.08)]",
          "transition-all duration-150"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "border-2 border-primary/40 font-semibold",
        day_outside:
          "day-outside text-muted-foreground/50 aria-selected:bg-muted/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground/30 opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
