import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Path, useFormContext } from "react-hook-form"
import { Button } from "~/components/ui/button"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "~/components/ui/command"
import { FormField, FormItem, FormLabel } from "~/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { POE2Query } from "~/lib/poe2-query-schema"

interface SelectFieldProps {
    name: Path<POE2Query>
    label: string
    options: any[]
    optionLabel: string
    optionValue: string
}

export const SelectField = ({ name, label, options, optionLabel, optionValue }: SelectFieldProps) => {
    const [open, setOpen] = useState(false)
    const form = useFormContext<POE2Query>()

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                    <FormLabel className="text-xs text-muted-foreground">{label}</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className=" justify-between h-6 text-xs transition-colors hover:border-primary px-2"
                            >
                                {options?.find(opt => opt[optionValue] === field.value)?.[optionLabel] || "Any"}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                            <Command>
                                <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
                                <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                                <CommandList>
                                    {options?.map((option) => (
                                        <CommandItem
                                            key={option[optionValue] ?? "any"}
                                            value={option[optionValue] ?? "any"}
                                            onSelect={(value) => {
                                                field.onChange(value)
                                                setOpen(false)
                                            }}
                                        >
                                            {option[optionLabel]}
                                        </CommandItem>
                                    ))}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </FormItem>
            )}
        />
    )
}
