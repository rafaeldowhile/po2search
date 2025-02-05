import { POE2Query, StatsFilter, StatItem } from "../poe2-query-schema";

export const createEmptyStatItem = (): StatItem => ({
    id: "",
    disabled: false,
    value: {
        min: undefined,
        max: undefined,
        weight: undefined
    }
});

export const createEmptyStatsFilter = (): StatsFilter => ({
    type: "and",
    disabled: false,
    filters: [createEmptyStatItem()]
});

export const createEmptyQuery = (): POE2Query => ({
    query: {
        stats: [createEmptyStatsFilter()],
        status: {
            option: "any"
        },
        filters: {
            type_filters: { disabled: false },
            equipment_filters: { disabled: false },
            req_filters: { disabled: false },
            misc_filters: { disabled: false }
        }
    }
});

export const mergeWithEmptyQuery = (existingQuery?: Partial<POE2Query>): POE2Query => {
    const emptyQuery = createEmptyQuery();
    if (!existingQuery) return emptyQuery;
    
    return {
        ...emptyQuery,
        ...existingQuery,
        query: {
            ...emptyQuery.query,
            ...existingQuery.query
        }
    };
};
