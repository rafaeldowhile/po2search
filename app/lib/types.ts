import { RANGE_TYPES } from "./constants";
import { Item } from "./models/item";
import { POE2Query } from "./poe2-query-schema";
import { FILTER_TYPES } from "./search";

export interface SearchFilter {
    type: keyof typeof FILTER_TYPES;
    range_type?: keyof typeof RANGE_TYPES;
    enabled: boolean;
    extractValue: (lines: string[]) => any;
    transform: (value: any, config?: any) => any;
}

export const BroaderCategory = {
    'Weapon': 'weapon',
    'Armour': 'armour',
    'Accessory': 'accessory',
    'Jewel': 'jewel',
    'Flask': 'flask',
    'Gem': 'gem',
    'Map': 'map',
    'Divination Card': 'card',
    'Relic': 'sanctum',
    'Currency': 'currency',
} as const;

export type BroaderCategory = typeof BroaderCategory[keyof typeof BroaderCategory];

const Rarity = {
    'Normal': 'normal',
    'Magic': 'magic',
    'Rare': 'rare',
    'Unique': 'unique',
    'Currency': 'currency',
    'Divination Card': 'card',
    'Gem': 'gem',
}

export type Rarity = keyof typeof Rarity;

export interface ParsedEquipment {
    damage: {
        min: number | null;
        max: number | null;
    };
    aps: number | null;
    dps: number | null;
    edps: number | null;
    block: number | null;
    rune_sockets: number | null;
    spirit: number | null;
    es: number | null;
    ar: number | null;
    ev: number | null;
    pdps: number | null;
    crit: number | null;
}

export interface ParsedRequirement {
    lvl: number | null;
    dex: number | null;
    str: number | null;
    int: number | null;
}

export interface StatData {
    id: string;
    text: string;
    type: string;
}

export type ItemHeader = {
    itemClassId: string;
    rarityId: Rarity;
    category: BroaderCategory;
    name: string;
    type: string;
}

export type ItemRequirements = {
    level: number;
    str: number;
    dex: number;
    int: number;
}
export interface ParsedItem {
    rarity?: string | null;
    itemLevel?: number | null;
    itemClass?: string | null;
    name?: string | null;
    type?: string | null;
    broaderCategory?: BroaderCategory | null;
    requirements?: ParsedRequirement;
    corrupted: boolean | null;
}

export interface InputData {
    blocks: InputDataItem[];
}

export interface InputDataItem {
    lines: InputDataItemLine[];
}
export interface InputDataItemLine {
    text: string;
    parsed: boolean;
}

export interface Mod {
    id: string;
    pattern: string;
    text: string;
    type: string;
    value?: number | null;
    range?: {
        min: number;
        max: number;
    } | null;
}


export interface DamageRange {
    min: number;
    max: number;
}

export interface WeaponDamageProperties {
    physicalDamage?: DamageRange;
    fireDamage?: DamageRange;
    coldDamage?: DamageRange;
    lightningDamage?: DamageRange;
    chaosDamage?: DamageRange;
    elementalDamage?: DamageRange;
}

export interface SearchModResult {
    id: string;
    pattern: string;
    text: string;
    type: string;
    value?: number | null;
    range?: {
        min: number;
        max: number;
    } | null;
}

export interface ParsedStat {
    id: string;
    text: string;
    values: {
        min: number;
        max?: number;
    }
}

export interface SearchResult {
    query: {
        filters: Record<string, any>;
        stats: Array<{
            type: string;
            filters: Array<{
                id: string;
                value: {
                    min?: number;
                    max?: number;
                };
            }>;
            disabled: boolean;
        }>;
        status: {
            option: string;
        };
    };
    sort: {
        price: 'asc' | 'desc';
    };
}


export enum ModCategory {
    explicit = 'explicit',
    implicit = 'implicit',
    enchant = 'enchant',
    crafted = 'crafted',
    veiled = 'veiled',
    fractured = 'fractured',
    scourge = 'scourge',
    pseudo = 'pseudo',
    rune = 'rune',
}

export const ModCategorySuffix: Record<ModCategory, string> = {
    [ModCategory.implicit]: ' (implicit)',
    [ModCategory.enchant]: ' (enchant)',
    [ModCategory.crafted]: ' (crafted)',
    [ModCategory.veiled]: ' (veiled)',
    [ModCategory.fractured]: ' (fractured)',
    [ModCategory.scourge]: ' (scourge)',
    [ModCategory.pseudo]: ' (pseudo)',
    [ModCategory.explicit]: ' (explicit)',
    [ModCategory.rune]: ' (rune)',
}

export const ModCategoryColorScheme: Record<ModCategory, { text: string; bg: string }> = {
    [ModCategory.implicit]: {
        text: 'text-green-500',
        bg: 'bg-green-100',
    },
    [ModCategory.enchant]: {
        text: 'text-yellow-500',
        bg: 'bg-yellow-100',
    },
    [ModCategory.crafted]: {
        text: 'text-yellow-500',
        bg: 'bg-yellow-100',
    },
    [ModCategory.veiled]: {
        text: 'text-purple-500',
        bg: 'bg-purple-100',
    },
    [ModCategory.fractured]: {
        text: 'text-yellow-500',
        bg: 'bg-yellow-100',
    },
    [ModCategory.scourge]: {
        text: 'text-red-500',
        bg: 'bg-red-100',
    },
    [ModCategory.pseudo]: {
        text: 'text-blue-500',
        bg: 'bg-blue-100',
    },
    [ModCategory.explicit]: {
        text: 'text-gray-500',
        bg: 'bg-gray-100',
    },
    [ModCategory.rune]: {
        text: 'text-blue-500',
        bg: 'bg-blue-100',
    }
}

export const ModCategorySuffixRegex: Record<ModCategory, RegExp> = {
    [ModCategory.implicit]: /(?:\ \(implicit\))/,
    [ModCategory.enchant]: /(?:\ \(enchant\))/,
    [ModCategory.crafted]: /(?:\ \(crafted\))?/,
    [ModCategory.veiled]: /(?:\ \(veiled\))/,
    [ModCategory.fractured]: /(?:\ \(fractured\))?/,
    [ModCategory.scourge]: /(?:\ \(scourge\))/,
    [ModCategory.pseudo]: /(?:\ \(pseudo\))/,
    [ModCategory.explicit]: /(?:\ \((?:crafted|fractured\))?)/,
    [ModCategory.rune]: /(?:\ \(rune\))?/,
}

export interface ModPattern {
    category: ModCategory,
    id: string,
    isOption: boolean,
    text: string,
    fuseText: string | null,
    pattern: RegExp,
    value?: number | null,
}

export interface ModLine {
    text: string;
    mods: Mod[];
    value?: number | null;
    range?: {
        min: number;
        max: number;
    } | null;
}
export interface QueryOptions {
    league: QueryLeague;
    status: 'any' | 'online' | 'onlineleague';
    options?: {
        minMax?: boolean;
    }
}

export enum QueryStatus {
    online = 'online',
    onlineleague = 'onlineleague',
    any = 'any',
}

export const QueryStatusLabels: Record<QueryStatus, string> = {
    [QueryStatus.online]: 'Online',
    [QueryStatus.onlineleague]: 'Online League',
    [QueryStatus.any]: 'Any',
}

export enum QueryLeague {
    Standard = 'Standard',
    Hardcore = 'Hardcore',
}

export enum QueryRealm {
    poe2 = 'poe2',
    poe = 'poe',
}

export const QueryRealmLabels: Record<QueryRealm, string> = {
    [QueryRealm.poe2]: 'PoE 2',
    [QueryRealm.poe]: 'PoE',
}

export const QueryLeagueLabels: Record<QueryLeague, string> = {
    [QueryLeague.Standard]: 'Standard',
    [QueryLeague.Hardcore]: 'Hardcore',
}


export interface Poe2QueryResponse {
    id: string;
    complexity: number;
    result: string[];
    total: number;
}

export interface SearchResponse {
    item?: Item;
    query?: POE2Query;
    data: {
        id: string;
        total: number;
        complexity: number;
        results: PoeItemResponse[];
    }
}


export interface PoeItemResponse {
    listing: {
        method: string;
        indexed: string;
        stash: {
            name: string;
            x: number;
            y: number;
        };
        whisper: string;
        account: {
            name: string;
            online: {
                league: string;
            };
            lastCharacterName: string;
            language: string;
            realm: string;
        },
        price: {
            type: string;
            amount: number;
            currency: string;
        }
    },
    item: {
        realm: string;
        verified: boolean;
        w: number;
        h: number;
        icon: string;
        league: string;
        id: string;
        corrupted: boolean;
        mirrored: boolean;
        sockets?: Array<{
            group: number;
            type: string;
            item: string;
        }>;
        name: string;
        typeLine: string;
        baseType: string;
        rarity: string;
        ilvl: number;
        identified: boolean;
        properties?: Array<{
            name: string;
            values: any[];
            displayMode: number;
            type: number;
        }>;
        requirements?: Array<{
            name: string;
            values: Array<[string, number]>;
            displayMode: number;
            type: number;
        }>;
        implicitMods?: string[];
        explicitMods?: string[];
        enchantMods?: string[];
        grantedSkills: {
            name: string;
            values: [[string, number]];
            displayMode: number;
            icon: string;
        }[];
        flavourText?: string[];
        runeMods?: string[];
        frameType: number;
        socketedItems?: Array<{
            realm: string;
            verified: boolean;
            w: number;
            h: number;
            icon: string;
            stackSize: number;
            maxStackSize: number;
            league: string;
            id: string;
            name: string;
            typeLine: string;
            baseType: string;
            ilvl: number;
            identified: boolean;
            properties: Array<{
                name: string;
                values: Array<[string, number]>;
                displayMode: number;
                type: number;
            }>;
            explicitMods: string[];
            descrText: string;
            frameType: number;
            socket: number;
        }>;
        socket?: number;
        extended?: {
            ar: number;
            ar_aug: boolean;
            ev?: number;
            ev_aug?: boolean;
            es?: number;
            es_aug?: boolean;
            aps?: number;
            aps_aug?: boolean;
            dps?: number;
            dps_aug?: boolean;
            edps?: number;
            edps_aug?: boolean;
            block?: number;
            block_aug?: boolean;
            spirit?: number;
            spirit_aug?: boolean;
            pdps?: number;
            pdps_aug?: boolean;
            crit?: number;
            crit_aug?: boolean;
            mods?: {
                explicit?: Array<{
                    name: string;
                    tier: string;
                    level: number;
                    magnitudes: Array<{
                        hash: string;
                        min: string;
                        max?: string;
                    }>;
                }>;
                implicit?: Array<{
                    name: string;
                    tier: string;
                    level: number;
                    magnitudes: Array<{
                        hash: string;
                        min: string;
                        max?: string;
                    }>;
                }>;
                enchant?: Array<{
                    name: string;
                    tier: string;
                    level: number;
                    magnitudes: Array<{
                        hash: string;
                        min: number;
                        max: number;
                    }>;
                }>;
            };
            hashes?: {
                explicit?: Array<[string, number[]]>;
                implicit?: Array<[string, number[]]>;
                enchant?: Array<[string, number[]]>;
                rune?: Array<[string, null]>;
                skill?: Array<[string, null]>;
            };
        };
    }
}

export interface ModInfo {
    text: string;
    name: string;
    tier: string | null;
    matched: boolean;
    matchingFilter?: StatFilter;
    type: 'implicit' | 'explicit' | 'enchant' | 'rune';
    hash: string;
    searchCriteria?: string;
}

export interface ItemProperty {
    name: string;
    values: [string | number, number][];
    displayMode: number;
    type: number;
}

export interface Socket {
    group: number;
    type: 'rune' | 'gem';
    attr?: string;
}

export interface RequirementType {
    name: string;
    values: [string, number][];
    displayMode: number;
    type: number;
}

export interface GrantedSkill {
    name: string;
    values: [[string, number]];
    displayMode: number;
    icon: string;
}

export interface SocketedGem {
    realm: string;
    verified: boolean;
    w: number;
    h: number;
    icon: string;
    stackSize?: number;
    maxStackSize?: number;
    league: string;
    id: string;
    name: string;
    typeLine: string;
    baseType: string;
    ilvl: number;
    identified: boolean;
    properties: Array<ItemProperty>;
    explicitMods: string[];
    descrText: string;
    frameType: number;
    socket: number;
}

export interface ExchangeRateResponse {
    success: boolean;
    timestamp: number;
    rates: {
        [key: string]: string;  // Currency rates as strings
    };
}