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
            enabled: false,
            extractValue: (lines: string[]) => extractOnlyNumber(getValueFromTextKey(lines, 'Quality:')),
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
                return extractOnlyNumber(value);
            },
            transform: (value: string) => parseInt(value, 10)
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
                const value = getValueFromTextKey(lines, 'Physical Damage:');
                if (!value) return null;
                const [min, max] = value.split('-').map(v => parseInt(v));
                return { min, max };
            },
            transform: (value: { min: number; max: number }, config: FilterConfig) => {
                return config.range_type === RANGE_TYPES.MIN_ONLY ? value.min : value;
            }
        },
        aps: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Attacks per Second:');
                return value ? parseFloat(value) : null;
            },
            transform: (value: number) => value
        },
        crit: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Critical Hit Chance:');
                return value ? parseFloat(value.replace('%', '')) : null;
            },
            transform: (value: number) => value
        },
        pdps: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const damage = getValueFromTextKey(lines, 'Physical Damage:');
                const aps = getValueFromTextKey(lines, 'Attacks per Second:');
                if (!damage || !aps) return null;

                const [min, max] = damage.split('-').map(v => parseInt(v));
                const attacksPerSecond = parseFloat(aps);
                return ((min + max) / 2) * attacksPerSecond;
            },
            transform: (value: number) => value
        },
        edps: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                // Find all elemental damage lines (fire, cold, lightning)
                const elementalDamages = lines
                    .filter(line => line.includes('Damage:') &&
                        (line.includes('Fire') ||
                            line.includes('Cold') ||
                            line.includes('Lightning')))
                    .map(line => {
                        const damage = line.split(':')[1].trim();
                        const [min, max] = damage.split('-').map(v => parseInt(v));
                        return (min + max) / 2;
                    });

                if (elementalDamages.length === 0) return null;

                // Just sum up the average elemental damages
                return elementalDamages.reduce((sum, dmg) => sum + dmg, 0);
            },
            transform: (value: number) => value
        },
        ar: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Armour:');
                return value ? parseInt(value) : null;
            },
            transform: (value: number) => value
        },
        ev: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Evasion:');
                return value ? parseInt(value) : null;
            },
            transform: (value: number) => value
        },
        es: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Energy Shield:');
                return value ? parseInt(value) : null;
            },
            transform: (value: number) => value
        },
        block: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Block:');
                return value ? parseInt(value.replace('%', '')) : null;
            },
            transform: (value: number) => value
        },
        spirit: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Spirit:');
                return value ? parseInt(value) : null;
            },
            transform: (value: number) => value
        },
        rune_sockets: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const socketLine = lines.find(line => line.includes('Sockets:'));
                if (!socketLine) return null;
                const socketPart = socketLine.split(':')[1];
                return socketPart.split(' ').filter(s => s === 'S').length;
            },
            transform: (value: number) => value
        },
        dps: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: true,
            extractValue: (lines: string[]) => {
                const value = getValueFromTextKey(lines, 'Damage per Second:');
                return value ? parseFloat(value) : null;
            },
            transform: (value: number) => value
        }
    },
    misc_filters: {
        gem_sockets: {
            type: FILTER_TYPES.RANGE,
            range_type: RANGE_TYPES.MIN_ONLY,
            enabled: false,
            extractValue: (lines: string[]) => {
                const socketLine = lines.find(line => line.includes('Sockets:'));
                if (!socketLine) return null;
                const socketPart = socketLine.split(':')[1];
                return socketPart.split(' ').filter(s => s === 'S').length;
            },
            transform: (value: number) => value
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
            enabled: true,
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
            const result: { min?: number; max?: number } = {};
            switch (filterConfig.range_type) {
                case RANGE_TYPES.MIN_ONLY:
                    if (transformedValue) {
                        result.min = typeof transformedValue === 'object' ?
                            transformedValue.min : transformedValue;
                    }
                    break;
                case RANGE_TYPES.MAX_ONLY:
                    if (transformedValue) {
                        result.max = transformedValue;
                    }
                    break;
                case RANGE_TYPES.MIN_MAX:
                    if (transformedValue && 'min' in transformedValue && 'max' in transformedValue) {
                        result.min = transformedValue.min;
                        result.max = transformedValue.max;
                    }
                    break;
                case RANGE_TYPES.EXACT:
                    if (transformedValue) {
                        result.min = transformedValue;
                        result.max = transformedValue;
                    }
                    break;
                default:
                    return null;
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
        const filterStates: { [key: string]: boolean } = {}; // Track individual filter states
        let hasFilters = false;

        for (const [filterName, filterConfig] of Object.entries(filterGroup)) {
            const value = filterConfig.extractValue(inputData);
            const filterResult = applyFilter(filterConfig, value);

            if (filterResult !== null) {
                filters[filterName] = filterResult;
                filterStates[filterName] = true; // Default to enabled
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
                    alternate_art: { option: "false" }
                },
                disabled: false,
                filterStates: {}
            };
        } else {
            // Ensure default values for misc filters that weren't set
            const defaultMiscFilters = {
                mirrored: { option: "false" },
                identified: { option: "true" },
                alternate_art: { option: "false" }
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
    return text.replace(/[+-]?\d+(\.\d+)?(%)?/g, match => match.endsWith('%') ? '#%' : '#');
}

function findStatId(normalizedText: string): string | null {
    const lowerCaseInput = normalizedText.toLowerCase();
    for (const [id, stat] of Object.entries(flatStats)) {
        if ((stat as StatData).text.toLowerCase() === lowerCaseInput) {
            return id;
        }
    }
    return null;
}

function extractStats(lines: string[], rangeType = RANGE_TYPES.MIN_MAX): any {
    const stats: {
        type: string;
        filters: StatFilter[];
        disabled: boolean;
    } = {
        type: "and",
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
        const normalizedText = normalizeStatText(line);
        const statId = findStatId(normalizedText);

        if (statId) {
            const numbers = line.match(/[+-]?\d+(\.\d+)?/g);
            if (numbers) {
                const value: { min?: number; max?: number } = {};

                if (rangeType === RANGE_TYPES.MIN_ONLY) {
                    value.min = parseFloat(numbers[0]);
                } else if (rangeType === RANGE_TYPES.MAX_ONLY) {
                    value.max = parseFloat(numbers[0]);
                } else {
                    value.min = parseFloat(numbers[0]);
                    value.max = numbers[1] ? parseFloat(numbers[1]) : parseFloat(numbers[0]);
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
                option: "onlineleague"
            }
        },
        sort: {
            price: 'asc'
        }
    };
}

export { search, FILTER_CONFIG, FILTER_TYPES };
