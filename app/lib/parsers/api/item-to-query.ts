import { Item } from "~/lib/models/item";
import { POE2Query } from "~/lib/poe2-query-schema";
import { QueryOptions, QueryStatus } from "~/lib/types";

const DEFAULT_DISABLED = {
    type_filters: {
        disabled: false,
    },
    equipment_filters: {
        disabled: true,
    },
    req_filters: {
        disabled: true,
    },
    misc_filters: {
        disabled: true,
    },
};

/**
 * Recursively removes properties that are empty objects.
 * If an object (or array) becomes empty, it returns undefined.
 *
 * @param obj The object to filter.
 * @returns A new object with empty objects removed, or undefined if everything is removed.
 */
function removeEmptyObjects(obj: any): any {
    // For non-objects, return as-is.
    if (typeof obj !== "object" || obj === null) {
        return obj;
    }

    // Process arrays: filter out any elements that become undefined.
    if (Array.isArray(obj)) {
        const newArr = obj
            .map(removeEmptyObjects)
            .filter((item) => item !== undefined);
        return newArr.length > 0 ? newArr : undefined;
    }

    // Process objects.
    const newObj: { [key: string]: any } = {};

    Object.keys(obj).forEach((key) => {
        const value = removeEmptyObjects(obj[key]);
        // Only add the property if:
        // 1. The value is not undefined, and
        // 2. The value is not an object that is empty.
        if (
            value !== undefined &&
            !(
                typeof value === "object" &&
                !Array.isArray(value) &&
                Object.keys(value).length === 0
            )
        ) {
            newObj[key] = value;
        }
    });

    // If no properties were added, return undefined.
    return Object.keys(newObj).length > 0 ? newObj : undefined;
}

export function itemToQuery(item: Item, params: QueryOptions) {
    const query: POE2Query = {
        query: {
            status: {
                option: params.status ?? QueryStatus.any
            },
            filters: {
                type_filters: {
                    ...DEFAULT_DISABLED.type_filters,
                    filters: {
                        category: {
                            option: item.header?.itemClassId
                        },
                        rarity: {
                            option: item.header?.rarityId
                        },
                        ilvl: {
                            min: item.properties?.itemLevel ?? undefined,
                            max: params.options?.minMax ? item.properties?.itemLevel ?? undefined : undefined
                        },
                        quality: {
                            min: item.properties?.quality ?? undefined,
                            max: params.options?.minMax ? item.properties?.quality ?? undefined : undefined
                        }
                    }
                },
                equipment_filters: {
                    ...DEFAULT_DISABLED.equipment_filters,
                    filters: {
                        damage: {
                            min: item.getTotalDamage() ?? undefined,
                            max: params.options?.minMax ? item.getTotalDamage() ?? undefined : undefined,
                        },
                        aps: {
                            min: item.properties?.attackSpeed ?? undefined,
                            max: params.options?.minMax ? item.properties?.attackSpeed ?? undefined : undefined
                        },
                        dps: {
                            min: item.getTotalDps() ?? undefined,
                            max: params.options?.minMax ? item.getTotalDps() ?? undefined : undefined
                        },
                        pdps: {
                            min: item.getPhysicalDps() ?? undefined,
                            max: params.options?.minMax ? item.getPhysicalDps() ?? undefined : undefined
                        },
                        edps: {
                            min: item.getElementalDps() ?? undefined,
                            max: params.options?.minMax ? item.getElementalDps() ?? undefined : undefined
                        },
                        block: {
                            min: item.properties?.block ?? undefined,
                            max: params.options?.minMax ? item.properties?.block ?? undefined : undefined
                        },
                        ev: {
                            min: item.properties?.evasion ?? undefined,
                            max: params.options?.minMax ? item.properties?.evasion ?? undefined : undefined
                        },
                        rune_sockets: {
                            min: item.sockets?.length ?? undefined,
                            max: params.options?.minMax ? item.sockets?.length ?? undefined : undefined
                        },
                        es: {
                            min: item.properties?.energyShield ?? undefined,
                            max: params.options?.minMax ? item.properties?.energyShield ?? undefined : undefined
                        },
                        ar: {
                            min: item.properties?.armour ?? undefined,
                            max: params.options?.minMax ? item.properties?.armour ?? undefined : undefined
                        },
                        crit: {
                            min: item.properties?.criticalHitChance ?? undefined,
                            max: params.options?.minMax ? item.properties?.criticalHitChance ?? undefined : undefined
                        }
                    },
                },
                req_filters: {
                    ...DEFAULT_DISABLED.req_filters,
                    filters: {
                        lvl: {
                            min: item.properties?.itemLevel ?? undefined,
                            max: params.options?.minMax ? item.properties?.itemLevel ?? undefined : undefined
                        }
                    }
                },
                misc_filters: {
                    ...DEFAULT_DISABLED.misc_filters,
                    filters: {
                        corrupted: {
                            option: item.properties?.corrupted ? 'true' : 'any'
                        },
                        identified: {
                            option: item.properties?.unidentified ? 'false' : 'any'
                        },
                        gem_sockets: {
                            min: item.sockets?.length ?? undefined,
                            max: params.options?.minMax ? item.sockets?.length ?? undefined : undefined
                        }
                    }
                },
            },
            stats: [
                {
                    type: 'and',
                    filters: [
                        ...(item.mods?.filter(mod => mod.mods.length === 1).flatMap(mainMod =>
                            mainMod.mods.map(mod => ({
                                disabled: false,
                                id: mod.id,
                                value: {
                                    min: mainMod.value ?? mainMod.range?.min,
                                    max: params.options?.minMax ? mainMod.value ?? mainMod.range?.max : undefined
                                }
                            }))
                        ) ?? [])
                    ]
                },
                {
                    type: 'count',
                    filters: [
                        ...(item.mods?.filter(mod => mod.mods.length > 1).flatMap(mainMod =>
                            mainMod.mods.map(mod => ({
                                disabled: false,
                                id: mod.id,
                                value: {
                                    min: mainMod.value ?? mainMod.range?.min,
                                    max: params.options?.minMax ? mainMod.value ?? mainMod.range?.max : undefined
                                }
                            }))
                        ) ?? [])
                    ]
                }
            ]
        }
    }

    return query;
}