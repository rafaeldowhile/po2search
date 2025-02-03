import { Checkbox } from "~/components/ui/checkbox";
import { FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import typeFiltersData from "~/data/type_filters.json";
import { TypeFiltersAttributes } from "~/lib/poe2-query-schema";

interface FormTypeFiltersProps {
    filters: TypeFiltersAttributes;
    form: any;
}

const minMaxFilters = [
    'ilvl',
    'quality'
] as const;

const displayOnlyFilters = [
    'category',
    'rarity',
] as const;

type MinMaxFilterKey = typeof minMaxFilters[number];
type DisplayOnlyFilterKey = typeof displayOnlyFilters[number];

function isMinMaxFilter(key: string): key is MinMaxFilterKey {
    return minMaxFilters.includes(key as MinMaxFilterKey);
}

function isDisplayOnlyFilter(key: string): key is DisplayOnlyFilterKey {
    return displayOnlyFilters.includes(key as DisplayOnlyFilterKey);
}

function getOptionText(filterKey: string, optionId: string): string {
    const filter = typeFiltersData.filters.find(f => f.id === filterKey);
    if (!filter?.option?.options) return optionId;

    const option = filter.option.options.find(opt => opt.id === optionId);
    return option?.text || optionId;
}

export const FormTypeFilters = ({ filters: typeFilters, form }: FormTypeFiltersProps) => {
    return (
        <section className="space-y-2.5">
            <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center gap-1.5 w-full">
                    <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 [&[data-state=open]>svg]:rotate-180" />
                    <h3 className="font-medium text-xs">Type Filters</h3>
                    <div className="h-px flex-1 bg-border" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1.5">
                    <div className="space-y-0.5 px-2">
                        <div className="flex items-center gap-2 py-2">
                            <FormField
                                control={form.control}
                                name="query.filters.type_filters.disabled"
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
                            <Label className="text-xs cursor-pointer text-muted-foreground">Enable Type Filters</Label>
                        </div>
                        {Object.keys(typeFilters).map((key) => {
                            const filter = typeFilters[key as keyof TypeFiltersAttributes];

                            if (isDisplayOnlyFilter(key)) {
                                return (
                                    <div key={key} className="flex flex-row gap-2 items-center">
                                        <Label className="text-sm cursor-pointer text-muted-foreground capitalize">
                                            {key}:
                                        </Label>
                                        <span className="text-sm">
                                            {filter && 'option' in filter ? getOptionText(key, filter.option || '') : ''}
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <div key={key} className="flex flex-row items-center gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`query.filters.type_filters.${key}.disabled`}
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
                                    <Label className="text-xs flex-1 cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors capitalize">
                                        {key}
                                    </Label>
                                    {isMinMaxFilter(key) && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name={`query.filters.type_filters.filters.${key}.min`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                placeholder={typeFilters[key]?.min?.toString() ?? ''}
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
                                                name={`query.filters.type_filters.filters.${key}.max`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                placeholder={typeFilters[key]?.max?.toString() ?? ''}
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
                                    {!isMinMaxFilter(key) && !isDisplayOnlyFilter(key) && (
                                        <div className="flex flex-col gap-4">
                                            {filter && 'option' in filter && filter.option ? getOptionText(key, filter.option) : null}
                                        </div>
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