import { z } from "zod";

const minMaxSchema = z.object({
    min: z.number().optional(),
    max: z.number().optional(),
}).partial();

const optionSchema = z.object({
    option: z.string().optional(),
}).partial();

const typeFilters = z.object({
    disabled: z.boolean(),
    filters: z.object({
        category: optionSchema.optional(),
        rarity: optionSchema.optional(),
        ilvl: minMaxSchema.optional(),
        quality: minMaxSchema.optional(),
    }).partial(),
}).partial();

const equipmentFilters = z.object({
    disabled: z.boolean(),
    filters: z.object({
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
    }).partial(),
}).partial();

const reqFilters = z.object({
    filters: z.object({
        lvl: minMaxSchema.optional(),
        dex: minMaxSchema.optional(),
        str: minMaxSchema.optional(),
        int: minMaxSchema.optional(),
    }).partial(),
}).partial();

const miscFilters = z.object({
    filters: z.object({
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
    }).partial(),
}).partial();

const statFilter = z.object({
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
const leagueTypes = z.enum(['Standard', 'Hardcore']) as z.ZodEnum<['Standard', 'Hardcore']>;

const baseStat = z.object({
    disabled: z.boolean().optional(),
    type: statTypes,
    filters: z.array(statFilter).optional(),
    value: minMaxSchema.optional(),
}).partial();

export const poe2QuerySchema = z.object({
    id: z.optional(z.string()),
    type: z.optional(z.string()),
    realm: z.string(),
    league: leagueTypes,
    status: statusTypes,
    filters: z.object({
        type_filters: typeFilters,
        equipment_filters: equipmentFilters,
        req_filters: reqFilters,
        misc_filters: miscFilters,
    }).partial(),
    stats: z.array(baseStat),
});

export type POE2Query = z.infer<typeof poe2QuerySchema>;