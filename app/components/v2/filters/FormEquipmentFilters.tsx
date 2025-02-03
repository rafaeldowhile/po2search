import { Checkbox } from "~/components/ui/checkbox";
import { FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import equipmentFiltersData from "~/data/equipment_filters.json";
import { EquipmentFiltersAttributes } from "~/lib/poe2-query-schema";

interface FormEquipmentFilters {
    filters: EquipmentFiltersAttributes;
    form: any;
}

function getKeyDescription(filterKey: string): string {
    const filter = equipmentFiltersData.find(f => f.id === filterKey);
    return filter?.text ?? '';
}

export const FormEquipmentFilters = ({ filters, form }: FormEquipmentFilters) => {
    return (
        <section className="space-y-2.5">
            <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center gap-1.5 w-full">
                    <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 [&[data-state=open]>svg]:rotate-180" />
                    <h3 className="font-medium text-xs">Equipment Filters</h3>
                    <div className="h-px flex-1 bg-border" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1.5">
                    <div className="space-y-0.5 px-2">
                        <div className="flex items-center gap-2 py-2">
                            <FormField
                                control={form.control}
                                name="query.filters.equipment_filters.disabled"
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
                            <Label className="text-xs cursor-pointer text-muted-foreground">Enable Equipment Filters</Label>
                        </div>
                        {Object.keys(filters).map((key) => {
                            return (
                                <div key={key} className="flex flex-row items-center gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`query.filters.equipment_filters.filters.${key}.disabled`}
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
                                        {getKeyDescription(key)}
                                    </Label>
                                    <FormField
                                        control={form.control}
                                        name={`query.filters.equipment_filters.filters.${key}.min`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        placeholder={filters[key as keyof EquipmentFiltersAttributes]?.min?.toString() ?? ''}
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
                                        name={`query.filters.equipment_filters.filters.${key}.max`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        placeholder={filters[key as keyof EquipmentFiltersAttributes]?.max?.toString() ?? ''}
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
                            )
                        })}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </section>
    )
}