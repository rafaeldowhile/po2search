import { Path, useFormContext } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form"
import { Button } from "~/components/ui/button"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "~/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { usePoeCategories, usePoeRarities } from "~/hooks/use-poe-categories"
import { POE2Query } from "~/lib/poe2-query-schema"
import { Check, ChevronDown } from "lucide-react"
import { useState } from "react"
import { MinMaxInput } from "./MinMaxInput"
import { SchemaFormField } from "./SchemaFormField"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { Collapsible, CollapsibleContent } from "~/components/ui/collapsible"

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
                    <FormLabel>{label}</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-[280px] justify-between"
                            >
                                {options?.find(opt => opt[optionValue] === field.value)?.[optionLabel] || "Select category..."}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
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

export const TypeFiltersSection = () => {
    const { data: poeCategories } = usePoeCategories()
    const { data: poeRarities } = usePoeRarities()
    const form = useFormContext<POE2Query>()
    const [isOpen, setIsOpen] = useState(true)

    return (
        <Card className="flex flex-col gap-0 bg-primary-foreground group">
            <CardHeader
                className="flex flex-col gap-2 m-0 p-1 px-2 pt-2 cursor-pointer hover:bg-muted/50 hover:rounded-xl transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <CardTitle className="flex gap-2">
                    <FormField
                        control={form.control}
                        name={'query.filters.type_filters.disabled'}
                        render={({ field }) => (
                            <FormItem onClick={(e) => e.stopPropagation()}>
                                <FormControl>
                                    <Checkbox
                                        id="type_filters"
                                        className="text-primary items-center"
                                        checked={!field.value}
                                        onCheckedChange={(checked) => {
                                            field.onChange(!checked);
                                        }}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Label className="text-[14px] cursor-pointer">Type filters</Label>
                </CardTitle>
            </CardHeader>
            <Collapsible open={isOpen} className="transition-all">
                <CollapsibleContent className="transition-all">
                    <CardContent className="p-0 pb-2 px-2">
                        <div className="flex flex-col gap-2">
                            <SchemaFormField
                                path={'query.filters.type_filters.filters.category.option'}
                                schemaType={'option'}
                                label={'Category'}
                                options={poeCategories}
                            />
                            <SchemaFormField
                                path={'query.filters.type_filters.filters.rarity.option'}
                                schemaType={'option'}
                                label={'Rarity'}
                                options={poeRarities}
                            />
                            
                            <SchemaFormField
                                path={'query.filters.type_filters.filters.ilvl'}
                                schemaType={'minMax'}
                                label={'Item level'}
                            />

                            <SchemaFormField
                                path={'query.filters.type_filters.filters.quality'}
                                schemaType={'minMax'}
                                label={'Quality'}
                            />
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}