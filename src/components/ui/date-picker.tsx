"use client"

import { useCallback } from "react"
import { format as dateFnsFormat, parse as dateFnsParse } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pilih tanggal",
}: DatePickerProps) {
  const selected = value ? dateFnsParse(value, "yyyy-MM-dd", new Date()) : undefined

  const handleSelect = useCallback(
    (day: Date | undefined) => {
      if (day && onChange) {
        onChange(dateFnsFormat(day, "yyyy-MM-dd"))
      }
    },
    [onChange]
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            "rounded-xl bg-white dark:bg-primary/5 border-primary/10 dark:border-primary/20",
            "hover:bg-primary/5 hover:border-primary/30 dark:hover:bg-primary/10",
            "transition-all duration-200",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary shrink-0" />
          <span>
            {selected
              ? dateFnsFormat(selected, "dd/MM/yyyy", { locale: id })
              : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
