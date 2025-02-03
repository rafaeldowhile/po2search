import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { InfoIcon, Loader2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { Item } from "~/lib/models/item";
import { POE2Query, poe2QuerySchema } from "~/lib/poe2-query-schema";
import { QueryOptions, SearchResponse } from "~/lib/types";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { FormEquipmentFilters } from "./filters/FormEquipmentFilters";
import { FormMiscFilters } from "./filters/FormMiscFilters";
import { FormStatFilters } from "./filters/FormStatFilters";
import { FormTypeFilters } from "./filters/FormTypeFilters";
import { FormRequirementFilters } from "./filters/FormRequirementFilters";
import { useEffect } from "react";

interface QueryEditorProps {
    item: Item;
    query: POE2Query;
    options?: QueryOptions;
    onSearchUpdate: (data: SearchResponse) => void;
}

export const QueryEditor = ({ item, query, onSearchUpdate, options }: QueryEditorProps) => {
    const form = useForm<POE2Query>({
        defaultValues: query,
        resolver: zodResolver(poe2QuerySchema),
    });

    // Add effect to reset form when query changes
    useEffect(() => {
        form.reset(query);
    }, [query, form]);

    const onSubmit = async (data: POE2Query) => {
        try {
            const response = await axios.post('/api/v2/search/update', {
                query: data,
                options: options
            });
            onSearchUpdate(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="w-full border rounded-lg bg-background px-4 py-2">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-x-6 gap-y-4 p-2">
                    {/* Add this section at the top for development */}
                    <div className="col-span-2">
                        {/* <div className="mb-4 p-2 bg-destructive/10 rounded-md">
                            <details>
                                <summary className="text-xs font-medium cursor-pointer">
                                    Form Errors Debug
                                </summary>
                                <pre className="mt-2 text-xs overflow-auto max-h-[200px]">
                                    {JSON.stringify(form.formState.errors, null, 2)}
                                </pre>
                            </details>
                        </div> */}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-semibold">Query Editor</h2>
                                <div className="px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground rounded">
                                    Active filters
                                </div>
                            </div>

                            <div className="col-span-2">
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 h-7 text-xs"
                                    disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <>
                                            <Search className="h-3 w-3 mr-1.5" />
                                            Run Query
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 pb-3">
                            <div className="flex items-center gap-2">
                                <FormField
                                    control={form.control}
                                    name="query.stats.0.type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <ToggleGroup
                                                    type="single"
                                                    value={field.value ?? 'and'}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        if (value === 'count' && !form.getValues('query.stats.0.value.min')) {
                                                            // Only set initial count if it's not already set
                                                            const currentCount = form.getValues().query?.stats?.[0]?.filters?.length ?? 0;
                                                            form.setValue('query.stats.0.value.min', currentCount > 1 ? currentCount : 1);
                                                        } else if (value === 'and') {
                                                            form.setValue('query.stats.0.value.min', undefined);
                                                        }
                                                    }}
                                                >
                                                    <ToggleGroupItem value="and" aria-label="Match All">
                                                        <span className="text-xs">Match All</span>
                                                    </ToggleGroupItem>
                                                    <ToggleGroupItem value="count" aria-label="Count Matching">
                                                        <span className="text-xs">Count Matching</span>
                                                    </ToggleGroupItem>
                                                </ToggleGroup>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                {form.watch('query.stats.0.type') === 'count' && (
                                    <FormField
                                        control={form.control}
                                        name="query.stats.0.value.min"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-16 h-8 px-2 text-sm border rounded"
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        onChange={(e) => {
                                                            const value = parseInt(e.target.value);
                                                            field.onChange(isNaN(value) ? '' : Math.max(1, value));
                                                        }}
                                                        min={1}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            <Popover>
                                <PopoverTrigger>
                                    <InfoIcon className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm">Count Matching</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Instead of requiring all stats to match exactly, Count Matching lets you find items that have at least X number of your desired stats.
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            For example: If you're looking for an item with 6 specific stats, but set the count to 4, it will find items that match any 4 (or more) of those 6 stats.
                                        </p>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div>
                            <FormStatFilters stats={query.query.stats ?? []} form={form} />
                        </div>

                    </div>
                    <div>
                        <FormTypeFilters filters={query.query.filters?.type_filters?.filters ?? {}} form={form} />
                    </div>
                    <div>
                        <FormEquipmentFilters filters={query.query.filters?.equipment_filters?.filters ?? {}} form={form} />
                    </div>
                    <div>
                        <FormRequirementFilters filters={query.query.filters?.req_filters?.filters ?? {}} form={form} />
                    </div>
                    <div>
                        <FormMiscFilters filters={query.query.filters?.misc_filters?.filters ?? {}} form={form} />
                    </div>
                </form>
            </Form>
        </div>
    )
}
