import { stringSimilarity } from 'string-similarity-js';
import flatStats from '~/data/flat_stats.json'
import categories from '~/data/type_filters/categories.json'
import rarities from '~/data/type_filters/rarity.json'
import reqFilters from '~/data/req_filters.json'

interface StatData {
    text: string;
    [key: string]: any;
}

interface FilterConfig {
    type: string;
    range_type?: string;
    enabled: boolean;
    extractValue: (lines: string[]) => any;
    transform: (value: any, config?: any) => any;
}

interface FilterGroup {
    [key: string]: FilterConfig;
}

interface FilterResult {
    filters: {
        [key: string]: any;
    };
    disabled: boolean;
    filterStates?: {
        [key: string]: boolean;
    };
}

interface SearchResult {
    query: {
        filters: {
            [key: string]: FilterResult;
        };
        stats: any[];
        status: {
            option: string;
        };
    };
    sort: {
        price: string;
    };
}

interface StatFilter {
    id: string;
    value: { min?: number; max?: number; };
    disabled?: boolean;
}

interface SearchOptions {
    enableStats?: boolean;
    enabledFilterGroups?: {
        type_filters?: boolean;
        req_filters?: boolean;
        equipment_filters?: boolean;
        misc_filters?: boolean;
    };
    rangeType?: string;
}

const typeFilters: {
    categories: any[];
    rarities: any[];
    requirements: any[];
} = {
    categories,
    rarities,
    requirements: reqFilters
};

const FILTER_TYPES = {
    EXACT: 'exact',    // exact match (min = max)
    RANGE: 'range',    // allows min/max
    OPTION: 'option',  // single option selection
    DISABLED: 'disabled' // filter is completely disabled
};

const RANGE_TYPES = {
    MIN_ONLY: 'min_only',     // only use minimum value
    MAX_ONLY: 'max_only',     // only use maximum value
    MIN_MAX: 'min_max',       // use both min and max
    EXACT: 'exact'            // min = max
};

const FILTER_CONFIG = {
    type_filters: {
        ilvl: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => getValueFromTextKey(lines, 'Item Level:'),
            transform: (value: string) => parseInt(value, 10)
        },
        quality: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => extractOnlyNumber(getValueFromTextKey(lines, '[Quality]:')),
            transform: (value: string) => parseInt(value, 10)
        },
        category: {
            type: FILTER_TYPES.OPTION,
            enabled: true,
            extractValue: getCategory,
            transform: (value: string) => ({ option: value })
        },
        rarity: {
            type: FILTER_TYPES.OPTION,
            enabled: true,
            extractValue: getRarity,
            transform: (value: string) => ({ option: value })
        }
    },
    req_filters: {
        lvl: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Level:');
                if (!value) return null;
                const num = parseInt(extractOnlyNumber(value) || '', 10);
                if (isNaN(num)) return null;

                // Only return the number, not an object
                return num;
            },
            transform: (value: number) => {
                if (typeof value !== 'number' || isNaN(value)) return null;

                // Only return min value since this is MIN_ONLY
                return {
                    min: value,
                    originalValue: {
                        min: value,
                        max: value
                    }
                };
            }
        },
        str: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Str:');
                return extractOnlyNumber(value);
            },
            transform: (value: string) => parseInt(value, 10)
        },
        dex: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Dex:');
                return extractOnlyNumber(value);
            },
            transform: (value: string) => parseInt(value, 10)
        },
        int: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Int:');
                return extractOnlyNumber(value);
            },
            transform: (value: string) => parseInt(value, 10)
        }
    },
    equipment_filters: {
        damage: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const line = lines.find(line => line.includes('Physical Damage:'));
                if (!line) return null;

                const matches = line.match(/(\d+)-(\d+)/);
                if (!matches) return null;

                const [_, min, max] = matches;
                return {
                    min: parseInt(min),
                    max: parseInt(max),
                    originalValue: {
                        min: parseInt(min),
                        max: parseInt(max)
                    }
                };
            },
            transform: (value: { min: number; max: number; originalValue?: { min: number; max: number } }) => {
                if (!value) return null;
                return {
                    min: value.min,
                    max: value.max,
                    originalValue: value.originalValue || { min: value.min, max: value.max }
                };
            }
        },
        aps: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Attacks per Second:');
                if (!value) return null;
                const num = parseFloat(value);
                return {
                    min: num,
                    max: num,
                    originalValue: { min: num, max: num }
                };
            },
            transform: (value: { min: number; max: number; originalValue?: { min: number; max: number } }) => {
                if (!value) return null;
                return {
                    min: value.min,
                    max: value.max,
                    originalValue: value.originalValue || { min: value.min, max: value.max }
                };
            }
        },
        crit: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Critical Strike Chance:');
                if (!value) return null;
                const num = parseFloat(value.replace('%', ''));
                return {
                    min: num,
                    max: num,
                    originalValue: { min: num, max: num }
                };
            },
            transform: (value: { min: number; max: number; originalValue?: { min: number; max: number } }) => {
                if (!value) return null;
                return {
                    min: value.min,
                    max: value.max,
                    originalValue: value.originalValue || { min: value.min, max: value.max }
                };
            }
        },
        ar: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Armour:');
                if (!value) return null;
                const num = parseInt(value);
                return isNaN(num) ? null : num;
            },
            transform: (value: number) => {
                if (typeof value !== 'number' || isNaN(value)) return null;
                return {
                    min: value,
                    originalValue: {
                        min: value,
                        max: value
                    }
                };
            }
        },
        ev: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Evasion:');
                if (!value) return null;
                const num = parseInt(value);
                return isNaN(num) ? null : num;
            },
            transform: (value: number) => {
                if (typeof value !== 'number' || isNaN(value)) return null;
                return {
                    min: value,
                    originalValue: {
                        min: value,
                        max: value
                    }
                };
            }
        },
        es: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Energy Shield:');
                if (!value) return null;
                const num = parseInt(value);
                return isNaN(num) ? null : num;
            },
            transform: (value: number) => {
                if (typeof value !== 'number' || isNaN(value)) return null;
                return {
                    min: value,
                    originalValue: {
                        min: value,
                        max: value
                    }
                };
            }
        },
        block: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Block:');
                if (!value) return null;
                const num = parseInt(value.replace('%', ''));
                return isNaN(num) ? null : num;
            },
            transform: (value: number) => {
                if (typeof value !== 'number' || isNaN(value)) return null;
                return {
                    min: value,
                    originalValue: {
                        min: value,
                        max: value
                    }
                };
            }
        },
        spirit: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Spirit:');
                if (!value) return null;
                const num = parseInt(value);
                return {
                    min: num,
                    max: num,
                    originalValue: { min: num, max: num }
                };
            },
            transform: (value: { min: number; max: number; originalValue?: { min: number; max: number } }) => {
                if (!value) return null;
                return {
                    min: value.min,
                    max: value.max,
                    originalValue: value.originalValue || { min: value.min, max: value.max }
                };
            }
        }
    },
    misc_filters: {
        gem_sockets: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_MAX,
            enabled: false,
            extractValue: (lines: string[]) => {
                const socketLine = lines.find(line => line.includes('Sockets:'));
                if (!socketLine) return null;
                const socketPart = socketLine.split(':')[1].trim();
                const count = socketPart.split(' ').filter(s => ['S', 'R', 'G', 'B', 'W'].includes(s)).length;
                return {
                    min: count,
                    max: count,
                    originalValue: {
                        min: count,
                        max: count
                    }
                };
            },
            transform: (value: number | { min: number; max: number }) => {
                if (typeof value === 'number') {
                    return {
                        min: value,
                        max: value,
                        originalValue: {
                            min: value,
                            max: value
                        }
                    };
                }
                return value;
            }
        },
        area_level: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: false,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Area Level:');
                return value ? parseInt(value) : null;
            },
            transform: (value: number) => value
        },
        stack_size: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: false,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Stack Size:');
                return value ? parseInt(value) : null;
            },
            transform: (value: number) => value
        },
        corrupted: {
            type: FILTER_TYPES.OPTION,
            enabled: true,
            extractValue: (lines: string[]) => lines.some(line => line.trim() === 'Corrupted'),
            transform: (value: boolean) => ({ option: value.toString() })
        },
        identified: {
            type: FILTER_TYPES.OPTION,
            enabled: true,
            extractValue: (lines: string[]) => {
                // Items are identified by default unless they have "Unidentified" tag
                return !lines.some(line => line === 'Unidentified');
            },
            transform: (value: boolean) => ({ option: value.toString() })
        },
        mirrored: {
            type: FILTER_TYPES.OPTION,
            enabled: true,
            extractValue: (lines: string[]) => lines.some(line => line === 'Mirrored'),
            transform: (value: boolean) => ({ option: value.toString() })
        },
        alternate_art: {
            type: FILTER_TYPES.OPTION,
            enabled: true,
            extractValue: (lines: string[]) => lines.some(line => line === 'Alternate Art'),
            transform: (value: boolean) => ({ option: value.toString() })
        }
    }
};

// First, let's add a configuration for default disabled states
const DEFAULT_DISABLED_FILTERS: { [key: string]: { [key: string]: boolean } } = {
    req_filters: {
        lvl: true,
        str: true,
        dex: true,
        int: true
    },
    type_filters: {
        ilvl: true,
        quality: true
    },
};

// Add this mapping near the top of the file with other constants
const MANUAL_CATEGORY_MAPPING: { [key: string]: string } = {
    "Staves": "weapon.staff",
    "Staff": "weapon.staff",
    "Foci": "accessory.focus",
    // Add more manual mappings if needed
};

function parseText(input: string): string[] {
    return input.split('\n').filter(line => line !== '--------');
}

function getValueFromTextKey(inputData: string[], text: string): string | null {
    const line = inputData.find(line =>
        line.toLowerCase().includes(text.toLowerCase())
    );
    if (!line) return null;
    // Still use the original text to preserve case in the replacement
    return line.substring(line.toLowerCase().indexOf(text.toLowerCase()) + text.length).trim();
}

function getCategory(inputData: string[]): string {
    const value = getValueFromTextKey(inputData, 'Item Class:')
    if (!value) {
        throw new Error('No Item Class found in input');
    }

    // First check manual mapping
    const manualCategory = MANUAL_CATEGORY_MAPPING[value];
    if (manualCategory) {
        return manualCategory;
    }

    const normalizedValue = value.toLowerCase();

    const category = typeFilters.categories.reduce<{ category: any; similarity: number } | null>((closest, current) => {
        const similarity = stringSimilarity(
            normalizedValue,
            current.text.toLowerCase()
        );

        if (!closest || similarity > closest.similarity) {
            return { category: current, similarity: similarity };
        }
        return closest;
    }, null);

    if (category && category.similarity >= 0.7) {
        return category.category.id;
    }

    throw new Error(`Could not find matching category for: ${value}`);
}

function getRarity(inputData: string[]): string {
    const value = getValueFromTextKey(inputData, 'Rarity:')
    if (!value) throw new Error('No Rarity found in input');

    const rarityFilter = typeFilters.rarities.find(rarity => rarity.text.toLowerCase() === value.toLowerCase());
    if (!rarityFilter) throw new Error(`Invalid rarity: ${value}`);

    return rarityFilter.id;
}

function extractOnlyNumber(input: string | null): string | null {
    if (!input) return null;
    return input.replace(/\D/g, '');
}

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
            const result: { min?: number; max?: number; originalValue?: { min?: number; max?: number } } = {};

            // Handle range values with original values
            if (typeof transformedValue === 'object') {
                // Preserve original values if they exist
                if (transformedValue.originalValue) {
                    result.originalValue = transformedValue.originalValue;
                } else {
                    result.originalValue = {
                        min: transformedValue.min,
                        max: transformedValue.max
                    };
                }

                // Only include values that are explicitly set
                if (transformedValue.min !== undefined && transformedValue.min !== null) {
                    result.min = transformedValue.min;
                }
                if (transformedValue.max !== undefined && transformedValue.max !== null) {
                    result.max = transformedValue.max;
                }
            } else if (typeof transformedValue === 'number') {
                result.originalValue = {
                    min: transformedValue,
                    max: transformedValue
                };
                result.min = transformedValue;
            }

            return Object.keys(result).length > 0 ? result : null;
        }
        case FILTER_TYPES.OPTION:
            return transformedValue;
        default:
            return null;
    }
}

function buildFilters(
    inputData: string[],
    enabledFilterGroups: SearchOptions['enabledFilterGroups'] = {}
): { [key: string]: FilterResult } {
    const result: { [key: string]: FilterResult } = {};

    for (const [groupName, filterGroup] of Object.entries(FILTER_CONFIG)) {
        // Skip disabled filter groups
        if (enabledFilterGroups[groupName as keyof typeof enabledFilterGroups] === false) {
            continue;
        }

        const filters: { [key: string]: any } = {};
        const filterStates: { [key: string]: boolean } = {};
        let hasFilters = false;

        for (const [filterName, filterConfig] of Object.entries(filterGroup)) {
            const value = filterConfig.extractValue(inputData);
            const filterResult = applyFilter(filterConfig, value);

            if (filterResult !== null) {
                filters[filterName] = filterResult;
                // Check if this filter should be disabled by default
                const shouldBeDisabled = DEFAULT_DISABLED_FILTERS[groupName as keyof typeof DEFAULT_DISABLED_FILTERS]?.[filterName];
                filterStates[filterName] = !shouldBeDisabled; // false if should be disabled, true otherwise
                hasFilters = true;
            }
        }

        if (hasFilters) {
            result[groupName] = {
                filters,
                disabled: false,
                filterStates
            };
        }
    }

    // Only add misc_filters defaults if misc_filters are enabled
    if (enabledFilterGroups.misc_filters !== false) {
        if (!result.misc_filters) {
            result.misc_filters = {
                filters: {
                    mirrored: { option: "false" },
                    identified: { option: "true" },
                    alternate_art: { option: "false" },
                    corrupted: { option: "true" },
                },
                disabled: false,
                filterStates: {
                    corrupted: true,
                }
            };
        } else {
            // Ensure default values for misc filters that weren't set
            const defaultMiscFilters = {
                mirrored: { option: "false" },
                identified: { option: "true" },
                alternate_art: { option: "false" },
                corrupted: { option: "true" },
            };

            for (const [key, value] of Object.entries(defaultMiscFilters)) {
                if (!result.misc_filters.filters[key]) {
                    result.misc_filters.filters[key] = value;
                    result.misc_filters.filterStates![key] = true; // Default to enabled
                }
            }
        }
    }

    // Ensure equipment_filters are properly structured
    if (result.equipment_filters) {
        const equipmentFilters = result.equipment_filters.filters;
        for (const [key, value] of Object.entries(equipmentFilters)) {
            // Make sure range filters have proper min/max structure
            if (value && typeof value === 'object' && ('min' in value || 'max' in value)) {
                equipmentFilters[key] = value;
            }
        }
    }

    return result;
}

function normalizeStatText(text: string): string {
    // Remove numbers and % signs for comparison
    return text.replace(/[+-]?\d+(\.\d+)?(%)?/g, match => match.endsWith('%') ? '#%' : '#');
}

function findStatId(text: string, context?: string): string | null {
    const normalizedText = normalizeStatText(text);
    const lowerCaseInput = normalizedText.toLowerCase();

    // Get the appropriate prefix based on context
    let prefix = '';
    if (text.includes('(rune)')) {
        prefix = 'rune.';
    } else if (text.includes('(enchant)')) {
        prefix = 'enchant.';
    } else if (text.includes('(implicit)')) {
        prefix = 'implicit.';
    }
    // If no special context, it's an explicit mod

    // First try to find exact match with the correct prefix
    for (const [id, stat] of Object.entries(flatStats)) {
        if (id.startsWith(prefix) && (stat as StatData).text.toLowerCase() === lowerCaseInput) {
            return id;
        }
    }

    // If no exact match found with prefix, try finding the best match
    let bestMatch: { id: string; similarity: number } | null = null;
    for (const [id, stat] of Object.entries(flatStats)) {
        // Only consider stats with the correct prefix
        if (!id.startsWith(prefix)) continue;

        const similarity = stringSimilarity(
            lowerCaseInput,
            (stat as StatData).text.toLowerCase()
        );

        if (!bestMatch || similarity > bestMatch.similarity) {
            bestMatch = { id, similarity };
        }
    }

    // Return the best match if it's similar enough
    if (bestMatch && bestMatch.similarity >= 0.7) {
        return bestMatch.id;
    }

    return null;
}

function extractStats(lines: string[], rangeType = RANGE_TYPES.MIN_MAX): any {
    const stats: {
        type: string;
        filters: StatFilter[];
        disabled: boolean;
        value?: { min?: number; max?: number };
    } = {
        type: "and", // Default to "and" type
        filters: [],
        disabled: false
    };

    // Get all mod lines (skip header sections)
    const modLines = lines.filter(line => {
        return line.match(/^[+-]?\d+/) || // Starts with number
            line.includes('increased') ||
            line.includes('reduced') ||
            line.includes('Adds') ||
            line.includes('Gain');
    });

    for (const line of modLines) {
        const statId = findStatId(line);

        if (statId) {
            const numbers = line.match(/[+-]?\d+(\.\d+)?/g);
            if (numbers) {
                const value: { min?: number; max?: number; originalValue?: { min?: number; max?: number } } = {};
                const num1 = parseFloat(numbers[0]);
                const num2 = numbers[1] ? parseFloat(numbers[1]) : num1;

                // Store original values
                value.originalValue = {
                    min: num1,
                    max: num2
                };

                // Set search values based on range type
                if (rangeType === RANGE_TYPES.MIN_ONLY) {
                    value.min = num1;
                } else if (rangeType === RANGE_TYPES.MAX_ONLY) {
                    value.max = num1;
                } else {
                    value.min = num1;
                    value.max = num2;
                }

                stats.filters.push({
                    id: statId,
                    value,
                    disabled: false
                });
            }
        }
    }

    return stats.filters.length > 0 ? stats : {};
}

function search(input: string, options: SearchOptions = {}): SearchResult {
    const {
        enableStats = true,
        enabledFilterGroups = {
            type_filters: true,
            req_filters: true,
            equipment_filters: true,
            misc_filters: true
        },
        rangeType = RANGE_TYPES.MIN_ONLY
    } = options;

    const inputData = parseText(input);
    const filters = buildFilters(inputData, enabledFilterGroups);
    const stats = enableStats ? extractStats(inputData, rangeType) : {};

    return {
        query: {
            filters,
            stats: Object.keys(stats).length > 0 ? [stats] : [],
            status: {
                option: "any"
            }
        },
        sort: {
            price: 'asc'
        }
    };
}

export { search, FILTER_CONFIG, FILTER_TYPES };
