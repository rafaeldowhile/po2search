import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { validateSearchParams, type ValidationError } from "~/lib/validation";
import type { SearchError, SearchParams, SearchResult } from "~/types/search";

const SEARCH_CACHE_KEY = "poe-search";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface SearchState {
    error: string | null;
    validationErrors: ValidationError[];
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
    });

    // Cache the last successful search result
    const { data: cachedResult } = useQuery<SearchResult>({
        queryKey: [SEARCH_CACHE_KEY],
        enabled: false, // Only fetch when explicitly requested
        staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    });

    const searchMutation = useMutation<SearchResult, SearchError, SearchParams>({
        mutationFn: async (searchParams) => {
            // Validate params
            const validationErrors = validateSearchParams(searchParams);
            if (validationErrors.length > 0) {
                // Instead of throwing immediately, we'll store the validation errors
                // and return a rejected promise with a proper error object
                setSearchState(prev => ({ ...prev, validationErrors }));
                return Promise.reject({
                    type: 'ValidationError',
                    message: 'Validation failed',
                    validationErrors
                });
            }

            const response = await fetch("/api/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(searchParams),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Search failed");
            }

            const data = await response.json();
            // Update cache with successful result
            queryClient.setQueryData([SEARCH_CACHE_KEY], data);
            return data;
        },
        onError: (error: any) => {
            // Don't set error state for validation errors since we handle them separately
            if (error.type !== 'ValidationError') {
                setSearchState(prev => ({
                    ...prev,
                    error: error.message,
                }));
            }
        },
        onSuccess: () => {
            setSearchState({
                error: null,
                validationErrors: [],
            });
        },
        retry: (failureCount, error: any) => {
            // Don't retry validation errors
            if (error.type === 'ValidationError') {
                return false;
            }
            return failureCount < MAX_RETRIES;
        },
        retryDelay: (attemptIndex) => {
            // Exponential backoff with a base of RETRY_DELAY
            return Math.min(RETRY_DELAY * Math.pow(2, attemptIndex), 30000);
        },
    });

    const reset = useCallback(() => {
        setSearchState({
            error: null,
            validationErrors: [],
        });
    }, []);

    /**
     * Perform a search with the given parameters
     * @param params Search parameters
     * @param isRefinedSearch Whether this is a refinement of a previous search
     */
    const search = useCallback(async (params: SearchParams, isRefinedSearch = false) => {
        reset();
        try {
            return await searchMutation.mutateAsync(params);
        } catch (error: any) {
            // If it's a validation error, we don't want to throw
            // since the errors are already in the state
            if (error.type !== 'ValidationError') {
                throw error;
            }
        }
    }, [reset, searchMutation.mutateAsync]);

    const clearErrors = () => {
        setSearchState({
            error: null,
            validationErrors: [],
        });
    };

    return {
        search,
        isSearching: searchMutation.isPending,
        error: searchState.error,
        validationErrors: searchState.validationErrors,
        clearErrors,
        result: searchMutation.data ?? cachedResult,
        retryCount: searchMutation.failureCount,
        reset
    };
}