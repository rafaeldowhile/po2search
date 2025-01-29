import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { ChevronDown, Search, Loader2 } from "lucide-react";
import type { ParsedQuery, StatFilter as StatFilterType, FilterGroup as FilterGroupType } from "~/types/search";
import { useQueryEditor } from "~/hooks/use-query-editor";
import { memo } from "react";
import { getFilterName, getGroupDisplayName } from "~/lib/filters";
import flatStats from "~/data/flat_stats.json";
import typeFiltersData from '~/data/type_filters.json';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";

interface QueryEditorProps {
    parsedQuery: ParsedQuery;
    onQueryChange: (newQuery: ParsedQuery) => void;
    onSearch: () => void;
    isSearching: boolean;
}

// Add this helper function to get the prefix badge
function getStatPrefix(statId: string) {
    if (statId.startsWith('rune.')) {
        return <span className="ml-1.5 px-1 py-0.5 text-[9px] bg-amber-500/10 text-amber-500 rounded">rune</span>;
    }
    if (statId.startsWith('enchant.')) {
        return <span className="ml-1.5 px-1 py-0.5 text-[9px] bg-blue-500/10 text-blue-500 rounded">enchant</span>;
    }
    if (statId.startsWith('implicit.')) {
        return <span className="ml-1.5 px-1 py-0.5 text-[9px] bg-purple-500/10 text-purple-500 rounded">implicit</span>;
    }
    return <span className="ml-1.5 px-1 py-0.5 text-[9px] bg-slate-500/10 text-slate-500 rounded">explicit</span>;
}

const StatFilterRow = memo(function StatFilterRow({
    stat,
    onUpdate
}: {
    stat: StatFilterType;
    onUpdate: (updates: Partial<{ disabled: boolean; value: { min?: number; max?: number } }>) => void;
}) {
    return (
        <div className="flex items-center gap-1.5 py-0.5 group text-xs">
            <Checkbox
                id={stat.id}
                checked={!stat.disabled}
                onCheckedChange={(checked) => onUpdate({ disabled: !checked })}
                className="h-3 w-3 transition-opacity opacity-70 group-hover:opacity-100"
            />
            <label
                htmlFor={stat.id}
                className="flex-1 cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors flex items-center"
            >
                <span>{flatStats[stat.id as keyof typeof flatStats]?.text || stat.id}</span>
                {getStatPrefix(stat.id)}
            </label>
            <div className="flex items-center gap-1">
                <Input
                    type="text"
                    value={stat.value.min ?? ''}
                    onChange={(e) => onUpdate({
                        value: {
                            ...stat.value,
                            min: e.target.value ? Number(e.target.value) : undefined
                        }
                    })}
                    className="w-16 h-6 text-xs transition-colors hover:border-primary px-1"
                    placeholder={stat.value.originalValue?.min?.toString() ?? 'min'}
                />
                <span className="text-muted-foreground">-</span>
                <Input
                    type="text"
                    value={stat.value.max ?? ''}
                    onChange={(e) => onUpdate({
                        value: {
                            ...stat.value,
                            max: e.target.value ? Number(e.target.value) : undefined
                        }
                    })}
                    className="w-16 h-6 text-xs text-muted-foreground transition-colors hover:border-primary px-1"
                    placeholder={stat.value.originalValue?.max !== undefined ? stat.value.originalValue.max.toString() : 'max'}
                />
            </div>
        </div>
    );
});

// Helper function to get display text from option ID
function getOptionText(filterKey: string, optionId: string): string {
    const filter = typeFiltersData.filters.find(f => f.id === filterKey);
    if (!filter?.option?.options) return optionId;

    const option = filter.option.options.find(opt => opt.id === optionId);
    return option?.text || optionId;
}

const FilterGroupSection = memo(function FilterGroupSection({
    groupKey,
    group,
    onUpdate
}: {
    groupKey: string;
    group: FilterGroupType;
    onUpdate: (filterKey: string, updates: Partial<{ enabled: boolean; min?: number; max?: number; option?: string }>) => void;
}) {
    const isMiscGroup = groupKey.startsWith('misc_');
    const isTypeGroup = groupKey.startsWith('type_');

    const renderFilterRow = (filterKey: string, isEnabled: boolean) => {
        const filter = group.filters[filterKey];
        const isBooleanOption = isMiscGroup && ['corrupted', 'identified', 'mirrored', 'alternate_art'].includes(filterKey);
        const isRangeFilter = isMiscGroup && [
            'gem_level',
            'gem_sockets',
            'quality',
            'stack_size',
            'map_tier',
            'map_packsize',
            'map_iiq',
            'map_iir'
        ].includes(filterKey);
        const isDisplayOnly = isTypeGroup && ['category', 'rarity'].includes(filterKey);

        if (isDisplayOnly) {
            return (
                <div key={filterKey} className="flex items-center gap-1.5 py-0.5 group text-xs">
                    <span className="text-muted-foreground">
                        {getFilterName(groupKey, filterKey)}:
                    </span>
                    <span className="font-medium">
                        {getOptionText(filterKey, filter.option ?? '')}
                    </span>
                </div>
            );
        }

        return (
            <div key={filterKey} className="flex items-center gap-1.5 py-0.5 group text-xs">
                <Checkbox
                    id={`${groupKey}-${filterKey}`}
                    checked={isBooleanOption ? filter?.option === "true" : isEnabled}
                    onCheckedChange={(checked) => {
                        if (isBooleanOption) {
                            onUpdate(filterKey, {
                                option: checked ? "true" : undefined,
                                enabled: checked as boolean
                            });
                        } else if (isRangeFilter) {
                            onUpdate(filterKey, {
                                enabled: checked as boolean,
                                min: filter.min,
                                max: filter.max
                            });
                        } else {
                            onUpdate(filterKey, { enabled: checked as boolean });
                        }
                    }}
                    className="h-3 w-3 transition-opacity opacity-70 group-hover:opacity-100"
                />
                <label
                    htmlFor={`${groupKey}-${filterKey}`}
                    className="flex-1 cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors"
                >
                    {getFilterName(groupKey, filterKey)}
                </label>
                {(isRangeFilter || (!isBooleanOption && filter.min !== undefined)) && (
                    <div className="flex items-center gap-1">
                        <Input
                            type="text"
                            value={filter.min ?? ''}
                            onChange={(e) => onUpdate(filterKey, {
                                ...filter,
                                min: e.target.value ? Number(e.target.value) : undefined,
                            })}
                            className="w-16 h-6 text-xs transition-colors hover:border-primary px-1"
                            placeholder={filter.originalValue?.min?.toString() ?? 'min'}
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                            type="text"
                            value={filter.max ?? ''}
                            onChange={(e) => onUpdate(filterKey, {
                                ...filter,
                                max: e.target.value ? Number(e.target.value) : undefined
                            })}
                            className="w-16 h-6 text-xs text-muted-foreground transition-colors hover:border-primary px-1"
                            placeholder={filter.originalValue?.max !== undefined ? filter.originalValue.max.toString() : 'max'}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center gap-1.5 w-full">
                <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 [&[data-state=open]>svg]:rotate-180" />
                <h3 className="font-medium text-xs">{getGroupDisplayName(groupKey)}</h3>
                <div className="h-px flex-1 bg-border" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-1.5">
                <div className="space-y-0.5">
                    {Object.entries(group.filterStates).map(([filterKey, isEnabled]) =>
                        renderFilterRow(filterKey, isEnabled)
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
});

export const QueryEditor = memo(function QueryEditor({
    parsedQuery,
    onQueryChange,
    onSearch,
    isSearching
}: QueryEditorProps) {
    const { updateStats, updateFilter } = useQueryEditor(parsedQuery, onQueryChange);

    const activeFiltersCount = [
        ...parsedQuery.query.stats[0]?.filters.filter(s => !s.disabled) ?? [],
        ...Object.entries(parsedQuery.query.filters).flatMap(([_, group]) =>
            Object.entries(group.filterStates).filter(([_, enabled]) => enabled)
        )
    ].length;

    const handleSortChange = (value: string) => {
        onQueryChange({
            ...parsedQuery,
            sort: {
                ...parsedQuery.sort,
                price: value
            }
        });
    };

    return (
        <div className="w-full border rounded-lg bg-background p-3 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold">Query Editor</h2>
                    <div className="px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground rounded">
                        {activeFiltersCount} active filters
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Select
                        value={parsedQuery.sort?.price || 'asc'}
                        onValueChange={handleSortChange}
                    >
                        <SelectTrigger className="h-7 w-[100px] text-xs">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc" className="text-xs">Price: Low to High</SelectItem>
                            <SelectItem value="desc" className="text-xs">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={onSearch}
                        disabled={isSearching}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 h-7 text-xs"
                    >
                        {isSearching ? (
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

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <section className="space-y-2.5">
                    {/* Stats Section */}
                    <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex items-center gap-1.5 w-full">
                            <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 [&[data-state=open]>svg]:rotate-180" />
                            <h3 className="font-medium text-xs">Stats</h3>
                            <div className="h-px flex-1 bg-border" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-1.5">
                            <div className="space-y-2">
                                {/* Stats Mode Selection */}
                                <div className="flex items-center gap-4 pb-2">
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="radio"
                                            id="and"
                                            name="stats-mode"
                                            value="and"
                                            checked={parsedQuery.query.stats[0]?.type === 'and'}
                                            onChange={(e) => {
                                                const newStats = [...parsedQuery.query.stats];
                                                if (newStats[0]) {
                                                    newStats[0] = {
                                                        ...newStats[0],
                                                        type: 'and',
                                                        value: undefined
                                                    };
                                                    onQueryChange({
                                                        ...parsedQuery,
                                                        query: {
                                                            ...parsedQuery.query,
                                                            stats: newStats
                                                        }
                                                    });
                                                }
                                            }}
                                            className="h-3 w-3"
                                        />
                                        <Label htmlFor="and" className="text-xs cursor-pointer">Match All</Label>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="radio"
                                            id="count"
                                            name="stats-mode"
                                            value="count"
                                            checked={parsedQuery.query.stats[0]?.type === 'count'}
                                            onChange={(e) => {
                                                const newStats = [...parsedQuery.query.stats];
                                                if (newStats[0]) {
                                                    newStats[0] = {
                                                        ...newStats[0],
                                                        type: 'count',
                                                        value: { min: 1 }
                                                    };
                                                    onQueryChange({
                                                        ...parsedQuery,
                                                        query: {
                                                            ...parsedQuery.query,
                                                            stats: newStats
                                                        }
                                                    });
                                                }
                                            }}
                                            className="h-3 w-3"
                                        />
                                        <Label htmlFor="count" className="text-xs cursor-pointer">Count Matching</Label>
                                    </div>
                                </div>

                                {/* Count input in count mode */}
                                {parsedQuery.query.stats[0]?.type === 'count' && (
                                    <div className="flex items-center gap-2 pb-2">
                                        <Label className="text-xs text-muted-foreground">
                                            Minimum matching stats:
                                        </Label>
                                        <Input
                                            type="number"
                                            value={parsedQuery.query.stats[0]?.value?.min ?? ''}
                                            onChange={(e) => {
                                                const newStats = [...parsedQuery.query.stats];
                                                if (newStats[0]) {
                                                    newStats[0] = {
                                                        ...newStats[0],
                                                        value: {
                                                            ...newStats[0].value,
                                                            min: e.target.value ? Number(e.target.value) : undefined
                                                        }
                                                    };
                                                    onQueryChange({
                                                        ...parsedQuery,
                                                        query: {
                                                            ...parsedQuery.query,
                                                            stats: newStats
                                                        }
                                                    });
                                                }
                                            }}
                                            className="w-20 h-6 text-xs"
                                            placeholder="Min count"
                                        />
                                    </div>
                                )}

                                <div className="space-y-0.5">
                                    {parsedQuery.query.stats[0]?.filters.map((stat, index) => (
                                        <StatFilterRow
                                            key={stat.id}
                                            stat={stat}
                                            onUpdate={(updates) => updateStats(index, updates)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Type Filters */}
                    {Object.entries(parsedQuery.query.filters)
                        .filter(([key]) => key.startsWith('type_'))
                        .map(([groupKey, group]) => (
                            <FilterGroupSection
                                key={groupKey}
                                groupKey={groupKey}
                                group={group}
                                onUpdate={(filterKey, updates) => updateFilter(groupKey, filterKey, updates)}
                            />
                        ))}
                </section>

                <section className="space-y-2.5">
                    {/* Requirements and Equipment Filters */}
                    {Object.entries(parsedQuery.query.filters)
                        .filter(([key]) => key.startsWith('req_') || key.startsWith('equipment_'))
                        .map(([groupKey, group]) => (
                            <FilterGroupSection
                                key={groupKey}
                                groupKey={groupKey}
                                group={group}
                                onUpdate={(filterKey, updates) => updateFilter(groupKey, filterKey, updates)}
                            />
                        ))}
                </section>

                {/* Miscellaneous Filters */}
                <section className="col-span-2">
                    {Object.entries(parsedQuery.query.filters)
                        .filter(([key]) => key.startsWith('misc_'))
                        .map(([groupKey, group]) => (
                            <FilterGroupSection
                                key={groupKey}
                                groupKey={groupKey}
                                group={group}
                                onUpdate={(filterKey, updates) => updateFilter(groupKey, filterKey, updates)}
                            />
                        ))}
                </section>
            </div>
        </div>
    );
}); 