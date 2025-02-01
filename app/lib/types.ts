import { RANGE_TYPES } from "./constants";
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
}