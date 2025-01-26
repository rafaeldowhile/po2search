import type { FilterGroup, ParsedQuery } from "~/types/search";

export function updateFilterGroup(
    parsedQuery: ParsedQuery,
    groupKey: string,
    updates: Partial<FilterGroup>
): ParsedQuery {
    return {
        ...parsedQuery,
        query: {
            ...parsedQuery.query,
            filters: {
                ...parsedQuery.query.filters,
                [groupKey]: {
                    ...parsedQuery.query.filters[groupKey],
                    ...updates,
                },
            },
        },
    };
}

export function updateFilterValue(
    parsedQuery: ParsedQuery,
    groupKey: string,
    filterKey: string,
    value: { min?: number; max?: number }
): ParsedQuery {
    return updateFilterGroup(parsedQuery, groupKey, {
        filters: {
            ...parsedQuery.query.filters[groupKey].filters,
            [filterKey]: {
                ...parsedQuery.query.filters[groupKey].filters[filterKey],
                ...value,
            },
        },
    });
}

export function updateFilterState(
    parsedQuery: ParsedQuery,
    groupKey: string,
    filterKey: string,
    enabled: boolean
): ParsedQuery {
    return updateFilterGroup(parsedQuery, groupKey, {
        filterStates: {
            ...parsedQuery.query.filters[groupKey].filterStates,
            [filterKey]: enabled,
        },
    });
}

export function updateStatsFilter(
    parsedQuery: ParsedQuery,
    index: number,
    updates: { disabled?: boolean; value?: { min?: number; max?: number } }
): ParsedQuery {
    return {
        ...parsedQuery,
        query: {
            ...parsedQuery.query,
            stats: parsedQuery.query.stats.map((statGroup) => ({
                ...statGroup,
                filters: statGroup.filters.map((s, i) =>
                    i === index ? { ...s, ...updates } : s
                ),
            })),
        },
    };
} 