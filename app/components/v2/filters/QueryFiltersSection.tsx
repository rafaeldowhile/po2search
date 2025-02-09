import { useFormContext } from "react-hook-form"
import { POE2Query } from "~/lib/poe2-query-schema"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { ItemTypeSelect } from "./ItemTypeSelect"
import { usePoeItems } from "~/hooks/use-poe-items"
import { Button } from "~/components/ui/button"
import { X } from "lucide-react"
import { useEffect } from 'react';

export const QueryFiltersSection = () => {
    const form = useFormContext<POE2Query>();
    const { data: items } = usePoeItems();
    const searchValue = form.watch('query.term');
    const typeValue = form.watch('query.type');
    const nameValue = form.watch('query.name');
    
    // Sync query values with display term
    useEffect(() => {
        if (!items) return;
        
        const allItems = items.result?.flatMap(category => category.entries) ?? [];
        const currentTerm = form.getValues('query.term');
        
        // Don't update if we're already showing the correct value
        if (currentTerm === nameValue || currentTerm === typeValue) return;
        
        // If we have both name and type, try to find the exact item
        if (nameValue && typeValue) {
            const exactMatch = allItems.find(item => 
                item.name === nameValue && item.type === typeValue
            );
            if (exactMatch) {
                form.setValue('query.name', exactMatch.name, { shouldTouch: false });
                return;
            }
        }

        // Try to find by name first
        if (nameValue) {
            const foundByName = allItems.find(item => item.name === nameValue);
            if (foundByName) {
                form.setValue('query.name', foundByName.type || '');
                return;
            }
        }
        
        // Fallback to type if name not found or doesn't exist
        if (typeValue) {
            const foundByType = allItems.find(item => item.type === typeValue);
            form.setValue('query.type', foundByType?.name || typeValue, { shouldTouch: false });
        }
    }, [typeValue, nameValue, items, form]);

    // Process items by category without filtering
    const processedItems = items?.result?.map(category => ({
        category: category.id,
        label: category.label,
        items: category.entries.map(entry => ({
            displayValue: entry.name || entry.type, // Prefer name over type for display
            ...entry,
            category: category.id
        }))
    })) ?? [];

    const handleSelect = (value: string | { type: string; name?: string }) => {
        if (typeof value === 'string') {
            // Custom search term
            form.setValue('query.term', value);
            form.setValue('query.type', '');
            form.setValue('query.name', '');
        } else {
            // Item selection - set both name and type
            form.setValue('query.type', value.type);
            form.setValue('query.name', value.name || '');
        }
    };

    return (
        <Card className="flex flex-col gap-0 bg-primary-foreground">
            <CardHeader className="flex flex-col gap-2 m-0 p-1 px-2 pt-2">
                <CardTitle className="flex gap-2">
                    <span className="text-[14px]">Search</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-2 px-2">
                <div className="flex gap-1 items-end">
                    <div className="flex-1">
                        <ItemTypeSelect
                            name="query.term"
                            label="Search items"
                            groupedItems={processedItems}
                            onValueChange={handleSelect}
                        />
                    </div>
                    {searchValue && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-[38px] w-8 shrink-0"
                            onClick={() => {
                                form.setValue('query.term', '');
                                form.setValue('query.type', '');
                                form.setValue('query.name', '');
                                form.setValue('query.term', '');
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
