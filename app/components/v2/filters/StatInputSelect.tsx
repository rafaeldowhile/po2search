import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
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
import { POE2Query, StatGroupTypeLabels } from "~/lib/poe2-query-schema";
import { ModCategoryColorScheme } from "~/lib/types";
import { cn } from "~/lib/utils";
import { ChevronDown, Trash2, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

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
    
    // Add control to dependencies to ensure it updates when fields change
    const formStats = form.watch('query.stats');
    const { fields: groups } = useFieldArray({
        name: 'query.stats',
        control: form.control,
    });

    const moveStatToGroup = (targetGroupIndex: number) => {
        const statData = form.getValues(`query.stats.${groupIndex}.filters.${index}`)
        
        // Add to target group
        form.setValue(
            `query.stats.${targetGroupIndex}.filters`,
            [...(form.getValues(`query.stats.${targetGroupIndex}.filters`) || []), statData],
            { shouldDirty: true }
        )
        
        // Remove from current group
        onRemove()
    }

    const moveToNewGroup = () => {
        const statData = form.getValues(`query.stats.${groupIndex}.filters.${index}`)
        
        // Create new group with the moved stat
        form.setValue(
            'query.stats',
            [
                ...(form.getValues('query.stats') || []),
                {
                    type: 'and',
                    disabled: false,
                    filters: [statData]
                }
            ],
            { shouldDirty: true }
        )
        
        // Remove from current group
        onRemove()
    }

    const cloneStatToGroup = (targetGroupIndex: number) => {
        const statData = form.getValues(`query.stats.${groupIndex}.filters.${index}`);
        
        // Add to target group
        form.setValue(
            `query.stats.${targetGroupIndex}.filters`,
            [...(form.getValues(`query.stats.${targetGroupIndex}.filters`) || []), statData],
            { shouldDirty: true }
        );
    }

    const cloneToNewGroup = () => {
        const statData = form.getValues(`query.stats.${groupIndex}.filters.${index}`);
        
        // Create new group with the cloned stat
        form.setValue(
            'query.stats',
            [
                ...(form.getValues('query.stats') || []),
                {
                    type: 'and',
                    disabled: false,
                    filters: [statData]
                }
            ],
            { shouldDirty: true }
        );
    }

    if (!statsFlat || isLoading) return null;

    return (
        <div className="flex gap-2 items-center">
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

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-accent"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                    {formStats?.map((group, idx) => idx !== groupIndex && (
                        <div key={idx}>
                            <DropdownMenuItem onClick={() => moveStatToGroup(idx)}>
                                Move to {group.name || `Group ${idx + 1}`}
                                <span className="ml-2 text-xs text-muted-foreground">
                                    ({StatGroupTypeLabels[group.type!]})
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => cloneStatToGroup(idx)}>
                                Clone to {group.name || `Group ${idx + 1}`}
                                <span className="ml-2 text-xs text-muted-foreground">
                                    ({StatGroupTypeLabels[group.type!]})
                                </span>
                            </DropdownMenuItem>
                        </div>
                    ))}
                    {formStats && formStats.length > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem onClick={moveToNewGroup}>
                        Move to New Group
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={cloneToNewGroup}>
                        Clone to New Group
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button
                size="icon"
                onClick={onRemove}>
                <Trash2 className="h-2 w-2" />
            </Button>
        </div>
    );
};
