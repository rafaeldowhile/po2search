export type RangeType = "min_only" | "max_only" | "minmax";

export interface RangeValue {
    min?: number;
    max?: number;
    originalValue?: {
        min?: number;
        max?: number;
    };
}

export interface StatFilter {
    id: string;
    text: string;
    value: RangeValue;
    disabled?: boolean;
}

export interface FilterValue {
    min?: number;
    max?: number;
    originalValue?: {
        min?: number;
        max?: number;
    };
    option?: string;
}

export interface FilterGroup {
    disabled?: boolean;
    filters: Record<string, FilterValue>;
    filterStates: Record<string, boolean>;
}

export interface ParsedQuery {
    query: {
        stats: Array<{
            type: string;
            filters: StatFilter[];
        }>;
        filters: Record<string, FilterGroup>;
    };
}

export interface SearchParams {
    input?: string;
    rangeType?: RangeType;
    enableStats?: boolean;
    enabledFilterGroups?: {
        type_filters?: boolean;
        req_filters?: boolean;
        equipment_filters?: boolean;
        misc_filters?: boolean;
    };
    parsedQuery?: ParsedQuery;
}

export interface SearchResult {
    matches: number;
    items: Array<{
        item: any; // We can define a proper Item interface later
        listing: any; // We can define a proper Listing interface later
    }>;
    searchId: string;
    parsedQuery: ParsedQuery;
}

export interface SearchError {
    message: string;
    code?: string;
}

export interface FilterItem {
    id: string;
    text: string;
    minMax?: boolean;
}

export interface TypeFilters {
    id: string;
    title: string;
    filters: FilterItem[];
}

// Add type for flat stats
export interface FlatStat {
    id: string;
    text: string;
    type: string;
}