"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface SearchOption {
  value: string
  label: string
  sublabel?: string
  id?: string
  raw?: Record<string, unknown>
}

interface DocumentSearchComboboxProps {
  placeholder?: string
  emptyMessage?: string
  onSearch: (query: string) => Promise<SearchOption[]>
  value: string
  onChange: (value: string) => void
  onSelectOption?: (option: SearchOption) => void
  selectedLabel?: string
  disabled?: boolean
}

export function DocumentSearchCombobox({
  placeholder = "Cari...",
  emptyMessage = "Tidak ditemukan",
  onSearch,
  value,
  onChange,
  onSelectOption,
  selectedLabel,
  disabled = false,
}: DocumentSearchComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<SearchOption[]>([])
  const [loading, setLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search — effect manages timeout lifecycle only
  React.useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }

    const q = searchQuery.trim()
    if (!q) return

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const results = await onSearch(q)
        setOptions(results)
      } catch {
        setOptions([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [searchQuery, onSearch])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal h-10"
          disabled={disabled}
        >
          {value ? (
            <span className="truncate font-medium">{selectedLabel ?? value}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Mencari...
              </div>
            )}
            {!loading && options.length === 0 && searchQuery && (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            )}
            {!loading && options.length === 0 && !searchQuery && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Ketik untuk mencari
              </div>
            )}
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id ?? option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue)
                    onSelectOption?.({ ...option, value: currentValue })
                    setOpen(false)
                    setSearchQuery("")
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.sublabel && (
                      <span className="text-xs text-muted-foreground">
                        {option.sublabel}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
