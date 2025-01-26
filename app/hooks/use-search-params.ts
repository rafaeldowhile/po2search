import { useState, useCallback } from 'react';
import type { SearchParams, ParsedQuery } from '~/types/search';
import { DEFAULT_SEARCH_PARAMS } from '~/constants/search';

export function useSearchParams() {
    const [searchParams, setSearchParams] = useState<SearchParams>(DEFAULT_SEARCH_PARAMS);

    const updateInput = useCallback((input: string) => {
        setSearchParams(prev => ({ ...prev, input }));
    }, []);

    const updateParsedQuery = useCallback((parsedQuery: ParsedQuery) => {
        setSearchParams(prev => ({ ...prev, parsedQuery }));
    }, []);

    const resetParams = useCallback(() => {
        setSearchParams(DEFAULT_SEARCH_PARAMS);
    }, []);

    return {
        searchParams,
        updateInput,
        updateParsedQuery,
        resetParams,
    };
} 