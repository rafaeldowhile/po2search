import { useState, useCallback } from "react";

const MAX_HISTORY_ITEMS = 5;

export function useSearchHistory() {
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    const addToHistory = useCallback((searchInput: string) => {
        setSearchHistory((prev) => {
            const newHistory = [searchInput, ...prev.filter((item) => item !== searchInput)];
            return newHistory.slice(0, MAX_HISTORY_ITEMS);
        });
    }, []);

    const clearHistory = useCallback(() => {
        setSearchHistory([]);
    }, []);

    return {
        searchHistory,
        addToHistory,
        clearHistory,
    };
} 