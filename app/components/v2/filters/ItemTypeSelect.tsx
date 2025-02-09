import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "~/components/ui/command";
import { FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { POE2Query } from "~/lib/poe2-query-schema";

interface ItemTypeSelectProps {
    name: 'query.type' | 'query.name';
    label: string;
    items: Array<{ type: string, name?: string, text?: string }>;
    showCategories?: boolean;
}

export const ItemTypeSelect = ({ name, label, items, showCategories = false }: ItemTypeSelectProps) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const form = useFormContext<POE2Query>();

    const filteredItems = items.filter(item => {
        const searchLower = search.toLowerCase();
        const matchType = item.type.toLowerCase().includes(searchLower);
        const matchName = item.name?.toLowerCase().includes(searchLower);
        return matchType || matchName;
    });

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
                                className="w-[280px] justify-between text-left"
                            >
                                {field.value || `Select ${label.toLowerCase()}...`}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                            <Command shouldFilter={false}>
                                <CommandInput 
                                    placeholder={`Search ${label.toLowerCase()}...`}
                                    value={search}
                                    onValueChange={setSearch}
                                />
                                <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                                <CommandList>
                                    {filteredItems.map((item, index) => (
                                        <CommandItem
                                            key={index}
                                            value={name === 'query.type' ? item.type : (item.name || item.type)}
                                            onSelect={(value) => {
                                                field.onChange(value);
                                                setSearch("");
                                                setOpen(false);
                                            }}
                                        >
                                            {name === 'query.type' ? item.type : (item.name || item.type)}
                                        </CommandItem>
                                    ))}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </FormItem>
            )}
        />
    );
};
