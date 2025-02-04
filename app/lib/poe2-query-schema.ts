import { z } from "zod";

const minMaxSchema = z.object({
    min: z.number().optional().nullable(),
    max: z.number().optional().nullable(),
}).partial();

const optionSchema = z.object({
    option: z.string().optional(),
}).partial();

const typeFiltersAttributes = z.object({
    category: optionSchema.optional(),
    rarity: optionSchema.optional(),
    ilvl: minMaxSchema.optional(),
    quality: minMaxSchema.optional(),
}).partial()

const typeFilters = z.object({
    disabled: z.boolean(),
    filters: typeFiltersAttributes,
}).partial();

const equipmentFiltersAttributes = z.object({
    damage: minMaxSchema.optional(),
    aps: minMaxSchema.optional(),
    dps: minMaxSchema.optional(),
    edps: minMaxSchema.optional(),
    block: minMaxSchema.optional(),
    ev: minMaxSchema.optional(),
    rune_sockets: minMaxSchema.optional(),
    spirit: minMaxSchema.optional(),
    es: minMaxSchema.optional(),
    ar: minMaxSchema.optional(),
    pdps: minMaxSchema.optional(),
    crit: minMaxSchema.optional(),
}).partial();

const equipmentFilters = z.object({
    disabled: z.boolean(),
    filters: equipmentFiltersAttributes
}).partial();

const reqFiltersAttributes = z.object({
    lvl: minMaxSchema.optional(),
    dex: minMaxSchema.optional(),
    str: minMaxSchema.optional(),
    int: minMaxSchema.optional(),
}).partial();

const reqFilters = z.object({
    disabled: z.boolean(),
    filters: reqFiltersAttributes,
}).partial();

const misFiltersAttributes =  z.object({
    gem_level: minMaxSchema.optional(),
    area_level: minMaxSchema.optional(),
    identified: optionSchema.optional(),
    mirrored: optionSchema.optional(),
    sanctum_gold: minMaxSchema.optional(),
    gem_sockets: minMaxSchema.optional(),
    stack_size: minMaxSchema.optional(),
    corrupted: optionSchema.optional(),
    alternate_art: optionSchema.optional(),
    unidentified_tier: minMaxSchema.optional(),
}).partial();

const miscFilters = z.object({
    disabled: z.boolean(),
    filters: misFiltersAttributes
}).partial();

export const statItem = z.object({
    id: z.string(),
    disabled: z.boolean().optional(),
    value: z.object({
        weight: z.number().optional(),
        min: z.number().optional(),
        max: z.number().optional(),
    }).partial(),
}).partial();

const statTypes = z.enum(['count', 'and', 'weight2']) as z.ZodEnum<['count', 'and', 'weight2']>;
const statusTypes = z.enum(['any', 'online', 'onlineleague']) as z.ZodEnum<['any', 'online', 'onlineleague']>;

const baseStat = z.object({
    disabled: z.boolean().optional(),
    type: statTypes,
    filters: z.array(statItem).optional(),
    value: minMaxSchema.optional(),
}).partial();

const sortDirection = z.enum(['asc', 'desc']) as z.ZodEnum<['asc', 'desc']>;

export const poe2QuerySchema = z.object({
    query: z.object({
        id: z.string().optional(),
        type: z.optional(z.string()),
        status: z.object({
            option: statusTypes,
        }),
        filters: z.object({
            type_filters: typeFilters,
            equipment_filters: equipmentFilters,
            req_filters: reqFilters,
            misc_filters: miscFilters,
        }).partial(),
        stats: z.array(baseStat),
    }).partial(),
    sort: z.object({
        indexed: sortDirection.optional(),
        price: sortDirection.optional(),
    }).partial().optional(),
});

export type POE2Query = z.infer<typeof poe2QuerySchema>;
export type StatItem = z.infer<typeof statItem>;
export type StatsFilter = z.infer<typeof baseStat>;
export type TypeFilters = z.infer<typeof typeFilters>;
export type TypeFiltersAttributes = z.infer<typeof typeFiltersAttributes>;
export type EquipmentFilters = z.infer<typeof equipmentFilters>;
export type EquipmentFiltersAttributes = z.infer<typeof equipmentFiltersAttributes>;
export type MiscFilters = z.infer<typeof miscFilters>;
export type MiscFiltersAttributes = z.infer<typeof misFiltersAttributes>;
export type ReqFilters = z.infer<typeof reqFilters>;
export type ReqFiltersAttributes = z.infer<typeof reqFiltersAttributes>;