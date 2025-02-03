import exchangeData from '~/data/exchangeData.json';
import flatStats from '~/data/flat_stats.json';
import { PoeItemResponse } from './types';
import { POE2Query } from './poe2-query-schema';
import { removeSquareBrackets } from './helpers';

export function getCurrencyData(currencyId: string) {
    return exchangeData.entries.find(entry => entry.id === currencyId);
}

export function extractNumbers(text: string | undefined) {
    if (!text) return [];
    const matches = text.matchAll(/[-]?\d+(?:\.\d+)?/g);
    return Array.from(matches).map(match => Number(match[0]));
}

export function compareValues(text: string, filter: StatFilter) {
    if (!filter?.value) return null;
    
    const numbers = extractNumbers(text);
    const filterMin = filter.value.min ?? filter.value.originalValue?.min;
    const filterMax = filter.value.max ?? filter.value.originalValue?.max ?? filterMin;

    if (!filterMin) return null;

    // Changed percentage calculation
    const calculatePercentDiff = (actual: number, target: number) => {
        // ((actual - target) / target) * 100 = x%
        return Math.round(((actual - target) / target) * 100);
    };

    if (numbers.length === 2) {
        // For range values (e.g. "adds 5-10 damage")
        const itemMin = numbers[0];
        const itemMax = numbers[1];
        const minDiff = calculatePercentDiff(itemMin, filterMin);
        const maxDiff = filterMax ? calculatePercentDiff(itemMax, filterMax) : minDiff;
        const avgDiff = Math.round((minDiff + maxDiff) / 2);
        
        return avgDiff !== 0 ? { 
            type: avgDiff > 0 ? 'higher' : 'lower', 
            diff: Math.abs(avgDiff)
        } : null;
    } else if (numbers[0] !== undefined) {
        // For single values
        const diff = calculatePercentDiff(numbers[0], filterMin);
        return diff !== 0 ? {
            type: diff > 0 ? 'higher' : 'lower',
            diff: Math.abs(diff)
        } : null;
    }
    return null;
}

export function buildMods(
    item: PoeItemResponse['item'], 
    type: 'explicit' | 'implicit' | 'rune' | 'enchant',
    query?: POE2Query
) {
    const extendedMods = type === 'rune' ? [] : (item.extended?.mods?.[type] || []);
    const displayMods = item[`${type}Mods`] || [];
    const hashMapping = item.extended?.hashes?.[type];

    if (!hashMapping) return [];

    // Helper to find matching filter
    const findMatchingFilter = (hash: string): StatFilter | undefined => {
        const stats = query?.query?.stats as QueryStat[];
        if (!stats?.length) return undefined;

        for (const stat of stats) {
            const filter = stat.filters.find(f => f.id === hash && !f.disabled);
            if (filter) return filter;
        }
        return undefined;
    };

    if (type === 'rune') {
        return hashMapping.map(([hash, _], index) => {
            const displayText = removeSquareBrackets(displayMods[index]);
            if (!displayText) return null;

            const matchingFilter = findMatchingFilter(hash);

            return {
                text: displayText,
                name: "Rune Effect",
                tier: null,
                matched: !!matchingFilter,
                matchingFilter,
                type,
                hash
            };
        }).filter(Boolean);
    }

    return hashMapping
        .filter(([_, indices]) => indices !== null)
        .map(([hash, indices = []], index) => {
            const [modIndex] = indices;
            const mod = extendedMods[modIndex];
            if (!mod) return null;

            const statInfo = flatStats[hash];
            if (!statInfo) return null;

            const numbers = extractNumbers(displayMods[index]);
            let text = statInfo.text || '';
            let currentIndex = 0;
            text = text.replace(/#/g, () => numbers[currentIndex++]?.toString() || '#');

            const matchingFilter = findMatchingFilter(hash);

            return {
                text,
                name: mod.name,
                tier: mod.tier,
                matched: !!matchingFilter,
                matchingFilter,
                type,
                hash
            };
        }).filter(Boolean);
}
