import { json } from "@remix-run/node";
import { ActionFunctionArgs } from "@remix-run/node";
import { search } from "~/lib/search";
import { RANGE_TYPES } from "~/lib/constants";
import POE2TradeAPI from "~/lib/poe2api";

interface SearchRequestBody {
    input?: string;
    rangeType?: string;
    enableStats?: boolean;
    enabledFilterGroups?: {
        type_filters?: boolean;
        req_filters?: boolean;
        equipment_filters?: boolean;
        misc_filters?: boolean;
    };
    // For refined searches
    parsedQuery?: {
        query: {
            filters: {
                [key: string]: {
                    filters: Record<string, any>;
                    disabled: boolean;
                    filterStates?: {
                        [key: string]: boolean;
                    };
                };
            };
            stats: Array<{
                type: string;
                filters: Array<{
                    id: string;
                    value: { min?: number; max?: number; };
                    disabled?: boolean;
                }>;
                disabled: boolean;
            }>;
            status: { option: string; };
        };
        sort: { price: string; };
    };
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.json() as SearchRequestBody;
    const {
        input,
        rangeType = RANGE_TYPES.MIN_ONLY,
        enableStats,
        enabledFilterGroups,
        parsedQuery
    } = formData;

    // If no input and no parsedQuery, return error
    if (!input && !parsedQuery) {
        return json({ error: 'Either input text or parsed query is required' }, { status: 400 });
    }

    try {
        const api = new POE2TradeAPI();

        let searchPayload = parsedQuery || search(input!, {
            rangeType,
            enableStats,
            enabledFilterGroups
        });

        // If it's a refined search, handle disabled filters
        if (parsedQuery) {
            // Handle type filters first
            const filters = { ...searchPayload.query.filters };
            for (const [groupKey, group] of Object.entries(filters)) {
                if (group.filterStates) {
                    const activeFilters: Record<string, any> = {};
                    for (const [filterKey, isEnabled] of Object.entries(group.filterStates)) {
                        if (isEnabled && group.filters[filterKey]) {
                            // Preserve originalValue but only send min for search
                            const filter = { ...group.filters[filterKey] };
                            if (filter.originalValue) {
                                filter.max = undefined; // Only use min for search
                            }
                            activeFilters[filterKey] = filter;
                        }
                    }
                    filters[groupKey] = {
                        ...group,
                        filters: activeFilters,
                        disabled: Object.keys(activeFilters).length === 0
                    };
                }
            }

            // Handle stats filtering with original values
            if (parsedQuery.query.stats.length > 0) {
                const activeStats = searchPayload.query.stats.map(statGroup => ({
                    ...statGroup,
                    disabled: statGroup.filters.every((stat: any) => stat.disabled),
                    activeFilters: statGroup.filters
                        .filter((stat: any) => !stat.disabled)
                        .map((stat: any) => ({
                            ...stat,
                            value: {
                                ...stat.value,
                                originalValue: stat.value.originalValue,
                                max: undefined // Only use min for search
                            }
                        }))
                }));

                searchPayload = {
                    ...searchPayload,
                    query: {
                        ...searchPayload.query,
                        filters,
                        stats: activeStats
                    }
                };
            }
        }

        const searchResult = await api.search(searchPayload);

        if (!searchResult?.result?.length) {
            return json({
                items: [],
                total: 0,
                searchId: searchResult.id,
                parsedQuery: searchPayload,
                isRefinedSearch: !!parsedQuery,
                matches: searchResult.total
            });
        }

        const totalResults = searchResult.result.length;
        const itemIds = searchResult.result.slice(0, 5);
        const fetchResult = await api.fetch(itemIds, searchResult.id);

        return json({
            items: fetchResult.data?.result || [],
            total: totalResults,
            searchId: searchResult.id,
            parsedQuery: searchPayload,
            isRefinedSearch: !!parsedQuery,
            matches: searchResult.total
        });
    } catch (error) {
        return json({
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            cause: error instanceof Error ? error.cause : undefined,
            parsedQuery: null,
            isRefinedSearch: !!parsedQuery
        }, { status: 400 });
    }
}
