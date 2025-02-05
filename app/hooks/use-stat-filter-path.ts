import { useCallback } from "react";

export const useStatFilterPath = (groupIndex: number, filterIndex: number) => {
    const base = `query.stats.${groupIndex}.filters.${filterIndex}`;
    
    return {
        base,
        id: `${base}.id`,
        disabled: `${base}.disabled`,
        min: `${base}.value.min`,
        max: `${base}.value.max`,
    };
}; 