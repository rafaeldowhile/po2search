import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import flatStats from "~/data/flat_stats.json";
import { StatItem } from "~/lib/poe2-query-schema";
import { ModCategoryColorScheme } from "~/lib/types";
import { cn } from "~/lib/utils";

interface StatInputRangeProps {
    filter: StatItem;
    form: any;
    groupIndex: number;
    index: number;
}

export const StatInputRange = ({ filter, form, groupIndex, index }: StatInputRangeProps) => {
    return (
        <div className="flex gap-4 items-center">
            <FormField
                control={form.control}
                name={`query.stats.${groupIndex}.filters.${index}.disabled`}
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
            <FormLabel className="text-xs flex-1 cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-2">
                {flatStats[filter.id as keyof typeof flatStats]?.text}
                <span className={cn(
                    "ml-1.5 px-1 py-0.5 text-[9px] rounded",
                    ModCategoryColorScheme[flatStats[filter.id as keyof typeof flatStats]?.type as keyof typeof ModCategoryColorScheme].bg,
                    ModCategoryColorScheme[flatStats[filter.id as keyof typeof flatStats]?.type as keyof typeof ModCategoryColorScheme].text
                )}>
                    {flatStats[filter.id as keyof typeof flatStats]?.type}
                </span>
            </FormLabel>
            <FormField
                control={form.control}
                name={`query.stats.${groupIndex}.filters.${index}.value.min`}
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Input
                                type="number"
                                {...field}
                                value={field.value ?? ''}
                                placeholder={filter.value?.min?.toString() ?? 'min'}
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
                name={`query.stats.${groupIndex}.filters.${index}.value.max`}
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Input
                                type="number"
                                {...field}
                                value={field.value ?? ''}
                                placeholder={filter.value?.max?.toString() ?? 'max'}
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
    );
};