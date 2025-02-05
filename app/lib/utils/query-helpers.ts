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

export function cleanQuery(obj: any): any {
    if (obj === null || obj === undefined) return undefined;
    
    // Early return if disabled is true
    if (obj.disabled === true) {
        return undefined;
    }
    
    if (Array.isArray(obj)) {
        const filtered = obj
            .map(item => cleanQuery(item))
            .filter(item => item !== undefined);
        return filtered.length ? filtered : undefined;
    }
    
    if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
            // Skip the disabled field initially
            if (key === 'disabled') continue;
            
            const cleanedValue = cleanQuery(value);
            if (cleanedValue !== undefined) {
                cleaned[key] = cleanedValue;
            }
        }

        // Only add disabled:false if there are other properties
        if (Object.keys(cleaned).length > 0 && obj.disabled === false) {
            cleaned.disabled = false;
        }
        
        // Don't return empty objects
        return Object.keys(cleaned).length ? cleaned : undefined;
    }
    
    // Return undefined for empty strings, null, or undefined
    if (obj === '' || obj === null || obj === undefined) {
        return undefined;
    }
    
    // Keep all other values (numbers, booleans, non-empty strings)
    return obj;
}
