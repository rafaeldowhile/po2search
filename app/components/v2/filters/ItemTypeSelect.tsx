import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "~/components/ui/command";
import { FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { POE2Query } from "~/lib/poe2-query-schema";

interface ItemTypeSelectProps {
    name: string;
    label: string;
    groupedItems: Array<{
        category: string;
        label: string;
        items: Array<{ type: string; name?: string; displayValue: string }>;
    }>;
    onValueChange: (value: string | { type: string; name?: string }) => void;
}

export const ItemTypeSelect = ({ name, label, groupedItems, onValueChange }: ItemTypeSelectProps) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [displayValue, setDisplayValue] = useState("");
    const ITEMS_PER_PAGE = 50;
    const form = useFormContext<POE2Query>();

    // Update display value based on query state
    useEffect(() => {
        const type = form.getValues('query.type');
        const name = form.getValues('query.name');
        const term = form.getValues('query.term');
        
        if (!type && !name && !term) {
            setDisplayValue("");
            return;
        }

        const allItems = groupedItems.flatMap(category => category.items);
        
        // Case 1: Name exists and matches an item
        if (name) {
            const foundByName = allItems.find(item => item.name === name);
            if (foundByName) {
                setDisplayValue(foundByName.name);
                return;
            }
        }

        // Case 2: Type exists and matches an item
        if (type) {
            const foundByType = allItems.find(item => item.type === type);
            if (foundByType) {
                setDisplayValue(foundByType.displayValue);
                return;
            }
        }

        // Case 3: Custom search term
        if (term) {
            setDisplayValue(term);
        }
    }, [form.getValues('query.type'), form.getValues('query.name'), form.getValues('query.term'), groupedItems]);

    // Filter categories and their items based on search
    const filteredGroups = groupedItems
        .map(category => ({
            ...category,
            items: category.items.filter(item =>
                item.displayValue.toLowerCase().includes(search.toLowerCase())
            )
        }))
        .filter(category => category.items.length > 0);

    // Calculate total items for pagination
    const totalItems = filteredGroups.reduce((acc, group) => acc + group.items.length, 0);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // Paginate the items while preserving category structure
    const paginatedGroups = filteredGroups.reduce((acc: typeof filteredGroups, category) => {
        let remainingItems = ITEMS_PER_PAGE;
        let skipItems = page * ITEMS_PER_PAGE;

        // Skip categories until we reach our page
        if (skipItems >= category.items.length) {
            skipItems -= category.items.length;
            return acc;
        }

        // Take items for current page
        const items = category.items.slice(skipItems, skipItems + remainingItems);
        if (items.length > 0) {
            acc.push({
                ...category,
                items
            });
        }

        return acc;
    }, []);

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
                                {displayValue || `Search for items...`}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                            <Command shouldFilter={false}>
                                <CommandInput 
                                    placeholder={`Search items...`}
                                    value={search}
                                    onValueChange={(value) => {
                                        setSearch(value);
                                        setPage(0); // Reset to first page on search
                                    }}
                                />
                                <CommandEmpty>
                                    <div className="py-2 px-4">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-sm"
                                            onClick={() => {
                                                field.onChange(search);
                                                onValueChange(search);
                                                setSearch("");
                                                setOpen(false);
                                            }}
                                        >
                                            Search for: "{search}"
                                        </Button>
                                    </div>
                                </CommandEmpty>
                                <CommandList>
                                    {paginatedGroups.map((category) => (
                                        <div key={category.category}>
                                            <CommandItem 
                                                value={`__category_${category.category}`}
                                                className="font-bold text-muted-foreground"
                                                disabled
                                            >
                                                {category.label}
                                            </CommandItem>
                                            {category.items.map((item, index) => (
                                                <CommandItem
                                                    key={`${category.category}-${index}`}
                                                    value={item.displayValue}
                                                    onSelect={() => {
                                                        field.onChange(item.displayValue);
                                                        onValueChange(item);
                                                        setSearch("");
                                                        setOpen(false);
                                                    }}
                                                    className="pl-6"
                                                >
                                                    {item.displayValue}
                                                </CommandItem>
                                            ))}
                                        </div>
                                    ))}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between p-2 border-t">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={page === 0}
                                                onClick={() => setPage(p => p - 1)}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm text-muted-foreground">
                                                Page {page + 1} of {totalPages}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={page >= totalPages - 1}
                                                onClick={() => setPage(p => p + 1)}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </FormItem>
            )}
        />
    );
};
