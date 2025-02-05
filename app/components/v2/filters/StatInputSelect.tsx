import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "~/components/ui/checkbox";
import { FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "~/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { useStatsFlat } from "~/hooks/use-stats-flat";
import { useFilteredStats } from "~/hooks/use-filtered-stats";
import { POE2Query } from "~/lib/poe2-query-schema";
import { ModCategoryColorScheme } from "~/lib/types";
import { cn } from "~/lib/utils";
import { ChevronDown, Trash2 } from "lucide-react";

interface StatInputSelectProps {
    groupIndex: number;
    index: number;
    onRemove: () => void;
}

export const StatInputSelect = ({ groupIndex, index, onRemove }: StatInputSelectProps) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const form = useFormContext<POE2Query>();
    const { data: statsFlat } = useStatsFlat();
    const { filteredStats, isLoading } = useFilteredStats(search);

    if (!statsFlat || isLoading) return null;

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

            <FormField
                control={form.control}
                name={`query.stats.${groupIndex}.filters.${index}.id`}
                render={({ field }) => (
                    <FormItem className="flex-1">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between text-xs h-8"
                                >
                                    {statsFlat[field.value as string]?.text || "Select stat..."}
                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0" align="start">
                                <Command shouldFilter={false}> {/* Important: disable built-in filtering */}
                                    <CommandInput
                                        placeholder="Search stats..."
                                        value={search}
                                        onValueChange={setSearch}
                                    />
                                    <CommandEmpty>No stats found.</CommandEmpty>
                                    <CommandList>
                                        {filteredStats.map((stat: any) => (
                                            <CommandItem
                                                key={stat.id}
                                                value={stat.id}
                                                onSelect={() => {
                                                    field.onChange(stat.id);
                                                    setSearch("");
                                                    setOpen(false);
                                                }}
                                            >
                                                {stat.text}
                                                <span className={cn(
                                                    "ml-2 text-[9px]",
                                                    ModCategoryColorScheme[stat.type as keyof typeof ModCategoryColorScheme]?.text
                                                )}>
                                                    {stat.type}
                                                </span>
                                            </CommandItem>
                                        ))}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </FormItem>
                )}
            />

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
                name={`query.stats.${groupIndex}.filters.${index}.value.max`}
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

            <Button
                size="icon"
                onClick={onRemove}>
                <Trash2 className="h-2 w-2" />
            </Button>
        </div>
    );
};
