import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { QueryLeague, QueryLeagueLabels, QueryOptions, QueryStatus, QueryStatusLabels, SearchResponse } from "~/lib/types";
import { Label } from "../ui/label";


const queryLeagueValues = Object.entries(QueryLeague).map(([key, value]) => value);
const queryStatusValues = Object.entries(QueryStatus).map(([key, value]) => value);

const itemFormSchema = z.object({
    itemDescription: z.string().min(1, "Item description is required"),
    league: z.enum(queryLeagueValues as [string, ...string[]]),
    status: z.enum(queryStatusValues as [string, ...string[]]),
});
type ItemFormValues = z.infer<typeof itemFormSchema>;

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

interface SearchFormProps {
    onSuccess: (response: SearchResponse, options: QueryOptions) => void
}

export const SearchForm = ({ onSuccess }: SearchFormProps) => {
    const [apiError, setApiError] = useState<string | null>(null);
    const { register, control, handleSubmit, formState: { isSubmitting, errors }, setValue, trigger } = useForm<ItemFormValues>({
        defaultValues: {
            itemDescription: exampleInput, // existing initial text
            league: QueryLeague.Standard,
            status: QueryStatus.onlineleague,
        },
        resolver: zodResolver(itemFormSchema),
    });

    // Add hotkey for form submission
    useHotkeys(
        `${navigator.platform.includes('Mac') ? 'meta' : 'ctrl'}+enter`,
        (e) => {
            e.preventDefault();
            handleSubmit(onSubmit)();
        },
        {
            enableOnFormTags: true,
            description: 'Submit search form',
        }
    );

    // Add paste handler
    const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const pastedText = e.clipboardData.getData('text');
        
        // Basic validation - check if it looks like a PoE item
        if (pastedText.includes('Rarity:') && pastedText.includes('--------')) {
            setValue('itemDescription', pastedText);
            
            // Validate the form
            const isValid = await trigger();
            if (isValid) {
                // Submit the form
                handleSubmit(onSubmit)();
            }
        }
    };

    const handleTextAreaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
        e.currentTarget.select();
    };

    const onSubmit = async (data: ItemFormValues) => {
        try {
            setApiError(null);
            console.log('hey');
            const response = await axios.post("/api/v2/search", {
                input: data.itemDescription,
                options: {
                    league: data.league,
                    status: data.status,
                }
            });
            onSuccess(response.data, { league: data.league as QueryOptions['league'], status: data.status as QueryOptions['status'] });
        } catch (e: any) {
            if (e instanceof AxiosError) {
                setApiError(e.response?.data?.message || "An error occurred");
            } else {
                setApiError("An unexpected error occurred");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
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
                            3. Paste here to search automatically
                        </li>
                    </ol>
                </div>
                <Textarea 
                    placeholder="Paste item data here..." 
                    {...register("itemDescription")} 
                    className="w-full min-h-[100px] p-3 text-sm bg-background border rounded-md resize-y"
                    onPaste={handlePaste}
                    onClick={handleTextAreaClick}
                />
                {errors.itemDescription && (
                    <p className="text-red-500 text-xs italic">{errors.itemDescription.message}</p>
                )}
            </div>

            <div className="flex flex-row justify-end items-end gap-4 flex-wrap">
                <div className="flex flex-row gap-2">
                    <div className="flex flex-row items-center gap-2">
                        <Label htmlFor="league" className="text-[12px] font-medium">League</Label>
                        <Controller
                            control={control}
                            name="league"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select league" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(QueryLeagueLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.league && <p className="text-red-500 text-xs italic">{errors.league.message}</p>}
                    </div>
                    <div className="flex flex-row justify-end items-center gap-2">
                        <Label htmlFor="status" className="text-[12px] font-medium">Status</Label>
                        <Controller
                            control={control}
                            name="status"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="w-[156px]">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(QueryStatusLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.status && <p className="text-red-500 text-xs italic">{errors.status.message}</p>}
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    {apiError && <p className="text-red-500 text-xs italic">{apiError}</p>}
                    <Button type="submit" className="w-32" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Searching...
                            </>
                        ) : (
                            <>
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
};