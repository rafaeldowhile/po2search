import { useState, useEffect } from 'react';
import { POE2Query } from '~/lib/poe2-query-schema';
import { QueryOptions } from '~/lib/types';

interface SearchHistoryEntry {
  id: string;
  query: POE2Query;
  options: QueryOptions;
  timestamp: number;
  itemName?: string;
}

export function useSearchHistory(maxEntries: number = 10) {
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('searchHistory');
      if (stored) {
        const parsedHistory = JSON.parse(stored);
        console.log('Loading stored history:', parsedHistory);
        setHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
      setHistory([]);
    }
  }, []);

  const addToHistory = (query: POE2Query, options: QueryOptions, itemName?: string) => {
    if (!query) {
      console.warn('Attempted to add null query to history');
      return;
    }

    const entry: SearchHistoryEntry = {
      id: crypto.randomUUID(),
      query,
      options,
      timestamp: Date.now(),
      itemName
    };

    console.log('Adding to history:', entry);

    setHistory(prev => {
      try {
        const filtered = prev.filter(h => 
          JSON.stringify(h.query) !== JSON.stringify(query)
        );
        const newHistory = [entry, ...filtered].slice(0, maxEntries);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        return newHistory;
      } catch (error) {
        console.error('Error updating history:', error);
        return prev;
      }
    });
  };

  const clearHistory = () => {
    localStorage.removeItem('searchHistory');
    setHistory([]);
  };

  return { history, addToHistory, clearHistory };
}
