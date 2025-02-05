import Fuse from 'fuse.js';
import { useMemo } from "react";
import { useStats } from "./use-stats-flat";

const ITEMS_PER_PAGE = 50;

interface StatEntry {
    id: string;
    text: string;
    type?: string;
}

interface StatGroup {
    id: string;
    label: string;
    entries: StatEntry[];
}

const fuseOptions = {
    keys: [{
        name: 'normalizedText',
        weight: 2
    }, {
        name: 'text',
        weight: 1
    }],
    threshold: 0.4,
    distance: 100,
    shouldSort: true,
    minMatchCharLength: 2
};

const normalizeText = (text: string) => {
    return text
        .toLowerCase()
        .replace(/[#%+\-]/g, ' ') // Replace special chars with space
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
};

export function useFilteredStats(searchTerm: string = "") {
    const { data: stats, isLoading } = useStats();

    const fuseInstance = useMemo(() => {
        if (!stats) return null;
        // Flatten all entries into a single array
        const allEntries = stats.flatMap(group => 
            group.entries.map(entry => ({
                ...entry,
                normalizedText: normalizeText(entry.text),
                group: group.label
            }))
        );
        return new Fuse(allEntries, fuseOptions);
    }, [stats]);

    const filteredStats = useMemo(() => {
        if (!fuseInstance) return [];
        if (!searchTerm.trim()) {
            // When no search term, return the original items
            // @ts-ignore
            return fuseInstance.getIndex().docs.slice(0, ITEMS_PER_PAGE);
        }

        return fuseInstance
            .search(searchTerm)
            .map(result => result.item)
            .slice(0, ITEMS_PER_PAGE);
    }, [fuseInstance, searchTerm]);

    return { 
        filteredStats: isLoading ? [] : filteredStats,
        isLoading 
    };
}
