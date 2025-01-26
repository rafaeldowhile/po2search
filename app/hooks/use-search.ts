import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { SearchParams, SearchResult, SearchError } from "~/types/search";
import { validateSearchParams, type ValidationError } from "~/lib/validation";

const SEARCH_CACHE_KEY = "poe-search";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface SearchState {
    error: string | null;
    validationErrors: ValidationError[];
    retryCount: number;
}

/**
 * Hook for managing PoE item search functionality
 * Handles search state, validation, caching, and retries
 */
export function useSearch() {
    const queryClient = useQueryClient();
    const [searchState, setSearchState] = useState<SearchState>({
        error: null,
        validationErrors: [],
        retryCount: 0,
    });

    // Cache the last successful search result
    const { data: cachedResult } = useQuery<SearchResult>({
        queryKey: [SEARCH_CACHE_KEY],
        enabled: false, // Only fetch when explicitly requested
        staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    });

    const searchMutation: any = useMutation<SearchResult, SearchError, SearchParams>({
        mutationFn: async (searchParams) => {
            // Validate params
            const validationErrors = validateSearchParams(searchParams);
            if (validationErrors.length > 0) {
                setSearchState(prev => ({ ...prev, validationErrors }));
                throw new Error("Validation failed");
            }

            try {
                const response = await fetch("/api/search", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(searchParams),
                });

                if (!response.ok) {
                    throw new Error("Search failed");
                }

                const data = await response.json();
                // Update cache with successful result
                queryClient.setQueryData([SEARCH_CACHE_KEY], data);
                return data;
            } catch (error) {
                // Handle retries
                if (searchState.retryCount < MAX_RETRIES) {
                    setSearchState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                    return searchMutation.mutate(searchParams);
                }
                throw error;
            }
        },
        onError: (error) => {
            setSearchState(prev => ({
                ...prev,
                error: error.message,
            }));
        },
        onSuccess: () => {
            setSearchState({
                error: null,
                validationErrors: [],
                retryCount: 0,
            });
        },
    });

    /**
     * Perform a search with the given parameters
     * @param params Search parameters
     * @param isRefinedSearch Whether this is a refinement of a previous search
     */
    const search = async (params: SearchParams, isRefinedSearch = false) => {
        // Reset state before new search
        setSearchState({
            error: null,
            validationErrors: [],
            retryCount: 0,
        });

        return searchMutation.mutate(params);
    };

    const clearErrors = () => {
        setSearchState({
            error: null,
            validationErrors: [],
            retryCount: 0,
        });
    };

    return {
        search,
        isSearching: searchMutation.isPending,
        error: searchState.error,
        validationErrors: searchState.validationErrors,
        clearErrors,
        result: searchMutation.data ?? cachedResult,
        retryCount: searchState.retryCount,
    };
}

// Add a new helper function to preserve original values
function preserveOriginalValues(value: any) {
    if (!value || typeof value !== 'object') return value;

    return {
        ...value,
        originalValue: {
            min: value.min,
            max: value.max
        },
        // By default, only use min value for search
        max: undefined
    };
}

// Modify the applyFilter function
function applyFilter(filterConfig: FilterConfig, value: any): any {
    if (!filterConfig.enabled || value === undefined || value === null) {
        return null;
    }

    const transformedValue = filterConfig.transform(value, filterConfig);
    if (transformedValue === null) {
        return null;
    }

    switch (filterConfig.type) {
        case FILTER_TYPES.RANGE: {
            const result = preserveOriginalValues(transformedValue);
            return Object.keys(result).length > 0 ? result : null;
        }
        case FILTER_TYPES.OPTION:
            return transformedValue;
        default:
            return null;
    }
} 