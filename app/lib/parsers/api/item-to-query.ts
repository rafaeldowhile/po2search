import { Item } from "~/lib/models/item";
import { POE2Query } from "~/lib/poe2-query-schema";
import { QueryOptions, QueryStatus } from "~/lib/types";
import items from "~/data/items.json";

// Helper function to find item in the database
function findItemInDatabase(headerType?: string, headerName?: string) {
    const allItems = items.result.flatMap(category => category.entries);
    
    if (headerName) {
        // Try to find by name first
        const foundByName = allItems.find(item => 
            item.name?.toLowerCase() === headerName.toLowerCase()
        );
        if (foundByName) {
            return {
                type: foundByName.type,
                name: foundByName.name,
                found: true
            };
        }
    }

    if (headerType) {
        // Try to find by type
        const foundByType = allItems.find(item => 
            item.type.toLowerCase() === headerType.toLowerCase()
        );
        if (foundByType) {
            return {
                type: foundByType.type,
                found: true
            };
        }
    }

    // If nothing is found, return the original values as term
    return {
        term: headerName || headerType,
        found: false
    };
}

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

export function itemToQuery(item: Item, params: QueryOptions) {
    const itemInfo = findItemInDatabase(item.header?.type, item.header?.name);
    
    const query: POE2Query = {
        query: {
            ...(itemInfo.found 
                ? {
                    type: itemInfo.type,
                    ...(itemInfo.name && { name: itemInfo.name })
                  }
                : {
                    term: itemInfo.term
                  }
            ),
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
        },
        sort: {
            price: 'asc'
        }
    }

    return query;
}