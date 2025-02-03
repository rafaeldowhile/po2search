import { Checkbox } from "~/components/ui/checkbox";
import { FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import typeFiltersData from "~/data/type_filters.json";
import { ReqFiltersAttributes } from "~/lib/poe2-query-schema";

interface FormRequirementFiltersProps {
    filters: ReqFiltersAttributes;
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

const requirementFields = {
    lvl: 'Level',
    dex: 'Dexterity',
    str: 'Strength',
    int: 'Intelligence'
} as const;

export const FormRequirementFilters = ({ filters, form }: FormRequirementFiltersProps) => {
    return (
        <section className="space-y-2.5">
            <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center gap-1.5 w-full">
                    <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 [&[data-state=open]>svg]:rotate-180" />
                    <h3 className="font-medium text-xs">Requirements</h3>
                    <div className="h-px flex-1 bg-border" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1.5">
                    <div className="space-y-0.5 px-2">
                        <div className="flex items-center gap-2 py-2">
                            <FormField
                                control={form.control}
                                name="query.filters.req_filters.disabled"
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
                                        <Label className="text-xs cursor-pointer text-muted-foreground">
                                            Enable Requirement Filters
                                        </Label>
                                    </FormItem>
                                )}
                            />
                        </div>
                        {Object.entries(requirementFields).map(([key, label]) => (
                            <div key={key} className="flex flex-row items-center gap-4">
                                <FormField
                                    control={form.control}
                                    name={`query.filters.req_filters.filters.${key}.disabled`}
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
                                <Label className="text-xs flex-1 cursor-pointer text-muted-foreground">
                                    {label}
                                </Label>
                                <FormField
                                    control={form.control}
                                    name={`query.filters.req_filters.filters.${key}.min`}
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
                                    name={`query.filters.req_filters.filters.${key}.max`}
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
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </section>
    );
};