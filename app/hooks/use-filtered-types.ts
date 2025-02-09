import { useMemo } from 'react';
import Fuse from 'fuse.js';

export function useFilteredTypes(search: string, options: any[] = []) {
    return useMemo(() => {
        if (!search) {
            return { filteredTypes: options, isLoading: false };
        }

        const fuse = new Fuse(options, {
            keys: ['type'],
            threshold: 0.3
        });

        const results = fuse.search(search);
        return {
            filteredTypes: results.map(result => result.item),
            isLoading: false
        };
    }, [options, search]);
}
