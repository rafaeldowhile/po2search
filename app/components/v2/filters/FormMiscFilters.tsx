import { Checkbox } from "~/components/ui/checkbox";
import { FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { MiscFiltersAttributes } from "~/lib/poe2-query-schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

interface FormMiscFiltersProps {
    filters: MiscFiltersAttributes;
    form: any;
}

const minMaxFilters = [
    'gem_level',
    'area_level',
    'sanctum_gold',
    'gem_sockets',
    'stack_size',
    'unidentified_tier'
] as const;

const optionFilters = [
    'identified',
    'mirrored',
    'corrupted',
    'alternate_art'
] as const;

type MinMaxFilterKey = typeof minMaxFilters[number];
type OptionFilterKey = typeof optionFilters[number];

function isMinMaxFilter(key: string): key is MinMaxFilterKey {
    return minMaxFilters.includes(key as MinMaxFilterKey);
}

function isOptionFilter(key: string): key is OptionFilterKey {
    return optionFilters.includes(key as OptionFilterKey);
}

function getFilterLabel(key: string): string {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export const FormMiscFilters = ({ filters, form }: FormMiscFiltersProps) => {
    return (
        <section className="space-y-2.5">
            <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center gap-1.5 w-full">
                    <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 [&[data-state=open]>svg]:rotate-180" />
                    <h3 className="font-medium text-xs">Misc Filters</h3>
                    <div className="h-px flex-1 bg-border" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1.5">
                    <div className="space-y-0.5 px-2">
                        <div className="flex items-center gap-2 py-2">
                            <FormField
                                control={form.control}
                                name="query.filters.misc_filters.disabled"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={!field.value}
                                                onCheckedChange={(checked) => {
                                                    field.onChange({ target: { value: !checked } });
                                                }}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Label className="text-xs cursor-pointer text-muted-foreground">Enable Misc Filters</Label>
                        </div>
                        {Object.keys(filters).map((key) => {
                            const filter = filters[key as keyof MiscFiltersAttributes];

                            return (
                                <div key={key} className="flex flex-row items-center gap-4">
                                    <Label className="text-xs flex-1 cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors">
                                        {getFilterLabel(key)}
                                    </Label>
                                    {isMinMaxFilter(key) && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name={`query.filters.misc_filters.filters.${key}.min`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                placeholder="min"
                                                                onChange={({ target }) => {
                                                                    field.onChange(target.value === '' ? null : target.valueAsNumber);
                                                                }}
                                                                className="w-16 h-6 text-xs transition-colors hover:border-primary px-1"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`query.filters.misc_filters.filters.${key}.max`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                placeholder="max"
                                                                onChange={({ target }) => {
                                                                    field.onChange(target.value === '' ? null : target.valueAsNumber);
                                                                }}
                                                                className="w-16 h-6 text-xs transition-colors hover:border-primary px-1"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}
                                    {isOptionFilter(key) && (
                                        <FormField
                                            control={form.control}
                                            name={`query.filters.misc_filters.filters.${key}.option`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select
                                                        value={field.value ?? 'any'}
                                                        onValueChange={(value) => {
                                                            field.onChange(value === 'any' ? undefined : value);
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-20 h-6 text-xs">
                                                            <SelectValue placeholder="Any" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="any" className="text-xs">Any</SelectItem>
                                                            <SelectItem value="true" className="text-xs">Yes</SelectItem>
                                                            <SelectItem value="false" className="text-xs">No</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </section>
    );
};