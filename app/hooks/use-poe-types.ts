import { useMemo } from 'react';
import itemsData from '../data/items.json';

export function usePoeTypes() {
    return useMemo(() => {
        const types = itemsData.result.flatMap(category =>
            category.entries
                .filter(entry => entry.type)
                .map(entry => entry.type)
        );
        
        const uniqueTypes = Array.from(new Set(types));
        return {
            data: uniqueTypes.map(type => ({
                label: type,
                value: type
            }))
        };
    }, []);
}
