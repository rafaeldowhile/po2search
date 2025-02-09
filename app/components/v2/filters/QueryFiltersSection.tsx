import { useFormContext } from "react-hook-form"
import { POE2Query } from "~/lib/poe2-query-schema"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { ItemTypeSelect } from "./ItemTypeSelect"
import { usePoeItems } from "~/hooks/use-poe-items" // You'll need to create this hook

export const QueryFiltersSection = () => {
    const form = useFormContext<POE2Query>();
    const { data: items } = usePoeItems();

    // Flatten all entries from all categories
    const allItems = items?.result?.flatMap(category => category.entries) ?? [];
    
    // Get unique types
    const uniqueTypes = Array.from(new Set(allItems.map(item => item.type))).map(type => ({ type }));
    
    // Get named items only
    const namedItems = allItems.filter(item => item.name && item.type);

    return (
        <Card className="flex flex-col gap-0 bg-primary-foreground">
            <CardHeader className="flex flex-col gap-2 m-0 p-1 px-2 pt-2">
                <CardTitle className="flex gap-2">
                    <span className="text-[14px]">Query filters</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-2 px-2">
                <div className="flex flex-col gap-2">
                    <ItemTypeSelect
                        name="query.type"
                        label="Type"
                        items={uniqueTypes}
                    />
                    <ItemTypeSelect
                        name="query.name"
                        label="Name"
                        items={namedItems}
                    />
                </div>
            </CardContent>
        </Card>
    );
};
