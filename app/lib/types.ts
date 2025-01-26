import { RANGE_TYPES } from "./constants";
import { FILTER_TYPES } from "./search";

export interface SearchFilter {
    type: keyof typeof FILTER_TYPES;
    range_type?: keyof typeof RANGE_TYPES;
    enabled: boolean;
    extractValue: (lines: string[]) => any;
    transform: (value: any, config?: any) => any;
}

export interface SearchResult {
    query: {
        filters: Record<string, any>;
        stats: Array<{
            type: string;
            filters: Array<{
                id: string;
                value: {
                    min?: number;
                    max?: number;
                };
            }>;
            disabled: boolean;
        }>;
        status: {
            option: string;
        };
    };
    sort: {
        price: 'asc' | 'desc';
    };
} 