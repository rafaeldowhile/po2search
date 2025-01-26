import { useCallback, useState } from "react";
import type { SearchParams } from "~/types/search";

export function useSearchParams() {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        rangeType: "min_only" // Set default range type
    });

    const updateSearchParams = useCallback((updates: Partial<SearchParams>) => {
        setSearchParams(prev => ({
            ...prev,
            ...updates
        }));
    }, []);

    const updateInput = useCallback((input: string) => {
        setSearchParams(prev => ({
            ...prev,
            input,
            parsedQuery: undefined
        }));
    }, []);

    const updateParsedQuery = useCallback((parsedQuery: any) => {
        setSearchParams(prev => ({
            ...prev,
            parsedQuery
        }));
    }, []);

    const resetParams = useCallback(() => {
        setSearchParams({
            rangeType: "min_only" // Keep default range type when resetting
        });
    }, []);

    return {
        searchParams,
        updateSearchParams,
        updateInput,
        updateParsedQuery,
        resetParams
    };
} 