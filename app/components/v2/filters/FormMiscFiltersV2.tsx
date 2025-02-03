import { Checkbox } from "~/components/ui/checkbox";
import { FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { MiscFiltersAttributes } from "~/lib/poe2-query-schema";

interface FormMiscFiltersProps {
    filters: MiscFiltersAttributes;
    form: any;
}

const FILTER_TYPES = {
    RANGE: 'range',
    BOOLEAN: 'boolean',
    SELECT: 'select'
} as const;

const FILTER_CONFIG = {
    gem_level: { type: FILTER_TYPES.RANGE },
    area_level: { type: FILTER_TYPES.RANGE },
    sanctum_gold: { type: FILTER_TYPES.RANGE },
    gem_sockets: { type: FILTER_TYPES.RANGE },
    stack_size: { type: FILTER_TYPES.RANGE },
    unidentified_tier: { type: FILTER_TYPES.RANGE },
    identified: { type: FILTER_TYPES.BOOLEAN },
    mirrored: { type: FILTER_TYPES.BOOLEAN },
    corrupted: { type: FILTER_TYPES.BOOLEAN },
    alternate_art: { type: FILTER_TYPES.BOOLEAN }
} as const;

type FilterKey = keyof typeof FILTER_CONFIG;

function getFilterConfig(key: string) {
    return FILTER_CONFIG[key as FilterKey] || { type: FILTER_TYPES.RANGE };
}

function getFilterLabel(key: string): string {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const RangeFilter = ({ filterKey, form }: { filterKey: string; form: any }) => (
    <>
        <FormField
            control={form.control}
            name={`query.filters.misc_filters.filters.${filterKey}.min`}
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
            name={`query.filters.misc_filters.filters.${filterKey}.max`}
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
);

const BooleanFilter = ({ filterKey, form }: { filterKey: string; form: any }) => (
    <FormField
        control={form.control}
        name={`query.filters.misc_filters.filters.${filterKey}.option`}
        render={({ field }) => (
            <FormItem className="flex items-center gap-2">
                <FormControl>
                    <Checkbox
                        checked={field.value === 'true'}
                        onCheckedChange={(checked) => {
                            field.onChange(checked ? 'true' : undefined);
                        }}
                        className="h-4 w-4"
                    />
                </FormControl>
            </FormItem>
        )}
    />
);

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
                    <div className="grid grid-cols-2 gap-2">
                        {Object.keys(filters).map((key) => {
                            const config = getFilterConfig(key);
                            
                            return (
                                <div key={key} className="flex flex-row items-center gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`query.filters.misc_filters.${key}.disabled`}
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
                                    <Label className="text-xs flex-1 cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors">
                                        {getFilterLabel(key)}
                                    </Label>
                                    {config.type === FILTER_TYPES.RANGE && (
                                        <RangeFilter filterKey={key} form={form} />
                                    )}
                                    {config.type === FILTER_TYPES.BOOLEAN && (
                                        <BooleanFilter filterKey={key} form={form} />
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