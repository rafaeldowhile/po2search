import { useCallback } from "react";
import type { ParsedQuery } from "~/types/search";

export function useQueryEditor(initialQuery: ParsedQuery, onChange: (query: ParsedQuery) => void) {
    const updateStats = useCallback((statIndex: number, updates: Partial<{ disabled: boolean; value: { min?: number; max?: number } }>) => {
        const newQuery = {
            ...initialQuery,
            query: {
                ...initialQuery.query,
                stats: initialQuery.query.stats.map(group => ({
                    ...group,
                    filters: group.filters.map((stat, i) =>
                        i === statIndex ? { ...stat, ...updates } : stat
                    )
                }))
            }
        };
        onChange(newQuery);
    }, [initialQuery, onChange]);

    const updateFilter = useCallback((groupKey: string, filterKey: string, updates: any) => {
        const newQuery = {
            ...initialQuery,
            query: {
                ...initialQuery.query,
                filters: {
                    ...initialQuery.query.filters,
                    [groupKey]: {
                        ...initialQuery.query.filters[groupKey],
                        filterStates: {
                            ...initialQuery.query.filters[groupKey].filterStates,
                            [filterKey]: updates.enabled ?? initialQuery.query.filters[groupKey].filterStates[filterKey]
                        },
                        filters: {
                            ...initialQuery.query.filters[groupKey].filters,
                            [filterKey]: {
                                ...initialQuery.query.filters[groupKey].filters[filterKey],
                                min: updates.min ?? initialQuery.query.filters[groupKey].filters[filterKey].min,
                                max: updates.max ?? initialQuery.query.filters[groupKey].filters[filterKey].max
                            }
                        }
                    }
                }
            }
        };

        // Handle boolean options (corrupted, identified, etc.)
        if ('option' in updates) {
            newQuery.query.filters[groupKey].filters[filterKey] = {
                ...newQuery.query.filters[groupKey].filters[filterKey],
                option: updates.option
            };
            newQuery.query.filters[groupKey].filterStates[filterKey] = updates.enabled;
        }

        // Update filter states
        if ('enabled' in updates) {
            newQuery.query.filters[groupKey].filterStates[filterKey] = updates.enabled;
        }

        // Update filter values
        if (updates.min !== undefined || updates.max !== undefined) {
            newQuery.query.filters[groupKey].filters[filterKey] = {
                ...newQuery.query.filters[groupKey].filters[filterKey],
                min: updates.min,
                max: updates.max
            };
        }

        onChange(newQuery);
    }, [initialQuery, onChange]);

    return {
        updateStats,
        updateFilter
    };
} 