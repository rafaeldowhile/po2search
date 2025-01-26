import type { SearchParams } from "~/types/search";

export interface ValidationError {
    field: string;
    message: string;
}

export function validateSearchParams(params: SearchParams): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate input
    if (!params.input?.trim() && !params.parsedQuery) {
        errors.push({
            field: "input",
            message: "Either input or parsed query is required",
        });
    }

    // Validate range type
    if (params.rangeType && !["min_only", "max_only", "minmax"].includes(params.rangeType)) {
        errors.push({
            field: "rangeType",
            message: "Invalid range type",
        });
    }

    // Validate parsed query if present
    if (params.parsedQuery) {
        // Validate stats
        if (params.parsedQuery.query.stats) {
            params.parsedQuery.query.stats.forEach((statGroup, groupIndex) => {
                statGroup.filters.forEach((filter, filterIndex) => {
                    if (filter.value.min !== undefined && isNaN(filter.value.min)) {
                        errors.push({
                            field: `stats[${groupIndex}].filters[${filterIndex}].min`,
                            message: "Min value must be a number",
                        });
                    }
                    if (filter.value.max !== undefined && isNaN(filter.value.max)) {
                        errors.push({
                            field: `stats[${groupIndex}].filters[${filterIndex}].max`,
                            message: "Max value must be a number",
                        });
                    }
                });
            });
        }
    }

    return errors;
} 