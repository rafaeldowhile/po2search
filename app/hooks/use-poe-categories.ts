import { useQuery } from "@tanstack/react-query";
import categoriesData from '~/data/type_filters/categories.json';
import rarityData from '~/data/type_filters/rarity.json';
import booleanOptions from '~/data/type_filters/boolean-options.json';

const optionData = {
    Category: categoriesData,
    Rarity: rarityData,
    Identified: booleanOptions,
    Mirrored: booleanOptions,
    Corrupted: booleanOptions,
    AlternateArt: booleanOptions,
    BooleanOptions: booleanOptions,
} as const;

type OptionKeys = keyof typeof optionData;

// Create a generic hook factory
const createOptionHook = (key: OptionKeys) => {
    return () => useQuery({
        queryKey: [`poe-${key}`],
        queryFn: async () => optionData[key]
    });
};

// Generate all hooks dynamically
export const usePoeCategories = createOptionHook('Category');
export const usePoeRarities = createOptionHook('Rarity');
export const usePoeIdentified = createOptionHook('Identified');
export const usePoeMirrored = createOptionHook('Mirrored');
export const usePoeCorrupted = createOptionHook('Corrupted');
export const usePoeAlternateArt = createOptionHook('AlternateArt');
export const usePoeBooleanOptions = createOptionHook('BooleanOptions');

// Export a hook getter for dynamic access
export const getHook = (name: string) => {
    console.log('Getting hook:', name)
    const hooks: Record<string, any> = {
        usePoeCategory: createOptionHook('Category'),
        usePoeRarity: createOptionHook('Rarity'),
        usePoeIdentified: createOptionHook('Identified'),
        usePoeMirrored: createOptionHook('Mirrored'),
        usePoeCorrupted: createOptionHook('Corrupted'),
        usePoeAlternateArt: createOptionHook('AlternateArt'),
    };
    return hooks[name];
};