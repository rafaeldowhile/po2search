import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { poe2QuerySchema, type POE2Query } from "~/lib/poe2-query-schema";
import { createEmptyStatItem } from "~/lib/utils/query-helpers";
import { EquipmentFiltersSection } from "./filters/EquipmentFiltersSection";
import { MiscFiltersSection } from "./filters/MiscFiltersSection";
import { RequirementFiltersSection } from "./filters/RequirementFiltersSection";
import { StatGroupsSection } from "./filters/StatGroupsSection";
import { TypeFiltersSection } from "./filters/TypeFiltersSection";
import axios from "axios";
import { Loader2, Search } from "lucide-react";
import { QueryOptions, SearchResponse } from "~/lib/types";
import { SearchQueryOptions } from "./filters/SearchQueryOptions";
import { useEffect, useState } from "react";
import { Textarea } from "~/components/ui/textarea";
import { z } from "zod";

interface CustomSearchFormProps {
    query: POE2Query;
    options: QueryOptions;
    onQueryChange: (query: POE2Query) => void;
    onOptionsChange: (options: QueryOptions) => void;
    onSearchResponse: (response: SearchResponse) => void;
}

const itemSchema = z.object({
    itemDescription: z.string()
});

const exampleInput = `
Item Class: Helmets
Rarity: Rare
Gale Visor
Advanced Soldier Greathelm
--------
Armour: 331 (augmented)
--------
Requirements:
Level: 48
Str: 88
--------
Item Level: 58
--------
78% increased Armour
+10 to maximum Life
+33 to maximum Mana
16% increased Rarity of Items found
32% increased Critical Hit Chance
15.6 Life Regeneration per second`.trim()


export const CustomSearchForm = ({
    query,
    options,
    onQueryChange,
    onOptionsChange,
    onSearchResponse
}: CustomSearchFormProps) => {
    const form = useForm<POE2Query>({
        resolver: zodResolver(poe2QuerySchema),
        defaultValues: query
    });

    const itemForm = useForm<{ itemDescription: string }>({
        resolver: zodResolver(itemSchema),
        defaultValues: { itemDescription: exampleInput }
    });

    const [isSearching, setIsSearching] = useState(false);

    // Add effect to update form when query changes externally
    useEffect(() => {
        form.reset(query);
    }, [query, form]);

    const onSubmit = async (data: POE2Query) => {
        try {
            setIsSearching(true);
            const response = await axios.post('/api/v2/search/update', {
                query: data,
                options: options
            });
            onQueryChange(data);
            onSearchResponse(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    }

    const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const pastedText = e.clipboardData.getData('text');
        if (!pastedText) return;

        try {
            setIsSearching(true);
            const response = await axios.post("/api/v2/search", {
                input: pastedText,
                options: options
            });
            onQueryChange(response.data.query as POE2Query);
            onSearchResponse(response.data);
            itemForm.setValue('itemDescription', pastedText); // Keep the pasted text
        } catch (error) {
            console.error(error);
            itemForm.setValue('itemDescription', pastedText); // Keep text in case of error
        } finally {
            setIsSearching(false);
        }
    };

    const handleTextAreaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
        e.currentTarget.select();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                    <SearchQueryOptions
                        options={options}
                        onOptionsChange={onOptionsChange}
                    />
                    <Button
                        type="submit"
                        size="sm"
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                        disabled={isSearching}
                    >
                        {isSearching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Search className="h-4 w-4 mr-1.5" />
                                Search
                            </>
                        )}
                    </Button>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>How to use:</span>
                        <ol className="flex items-center gap-2">
                            <li className="flex items-center gap-1">
                                1. Hover over an item in-game
                            </li>
                            <li className="flex items-center gap-1">
                                2. Press <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted">Ctrl + C</kbd>
                            </li>
                            <li className="flex items-center gap-1">
                                3. Paste here to generate search filters automatically
                            </li>
                        </ol>
                    </div>
                    <Textarea
                        placeholder="Paste item data here..."
                        className="w-full min-h-[80px] p-3 text-sm bg-background border rounded-md resize-y"
                        onPaste={handlePaste}
                        onClick={handleTextAreaClick}
                        disabled={isSearching}
                        {...itemForm.register('itemDescription')}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr,800px] gap-4">
                    <div className="flex flex-col gap-2">
                        <TypeFiltersSection />
                        <EquipmentFiltersSection />
                        <RequirementFiltersSection />
                        <MiscFiltersSection />
                    </div>
                    <div className="w-full overflow-x-auto">
                        <StatGroupsSection />
                    </div>
                </div>
            </form>
        </Form>
    );
};
