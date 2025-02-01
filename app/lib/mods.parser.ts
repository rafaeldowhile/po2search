import { normalizeStatText } from "./helpers";
import statsFlattened from "../data/flat_stats.json"
import { ParsedStat, StatData } from "./types";
import { stringSimilarity } from "string-similarity-js";


export function findStatId(text: string): StatData | null {
    const normalizedText = normalizeStatText(text);
    const lowerCaseInput = normalizedText.toLowerCase();

    // Get the appropriate prefix based on context
    let prefix = '';
    if (text.includes('(rune)')) {
        prefix = 'rune';
    } else if (text.includes('(enchant)')) {
        prefix = 'enchant';
    } else if (text.includes('(implicit)')) {
        prefix = 'implicit';
    }

    let stats = Object.values(statsFlattened);

    if (prefix) {
        stats = stats.filter(stat => stat.type === prefix);
    } else {
        stats = stats.filter(stat => !['rune', 'enchant', 'implicit'].includes(stat.type));
    }

    for (const stat of stats) {
        if (stat.text.toLowerCase() === lowerCaseInput) {
            return stat;
        }
    }

    // If no exact match found with prefix, try finding the best match
    let bestMatch: { stat: StatData; similarity: number } | null = null;
    for (const stat of stats) {
        const similarity = stringSimilarity(
            lowerCaseInput,
            (stat as StatData).text.toLowerCase()
        );
        if (!bestMatch || similarity > bestMatch.similarity) {
            bestMatch = { stat: stat, similarity };
        }
    }

    // Return the best match if it's similar enough
    if (bestMatch && bestMatch.similarity >= 0.7) {
        return bestMatch.stat;
    }

    return null;
}

export function parse(lines: string[]): ParsedStat[] {
    const stats: ParsedStat[] = [];

    for (const line of lines) {
        const stat = {} as ParsedStat;
        const foundStat = findStatId(line);

        if (!foundStat) {
            console.error(`No stat id found for line: ${line}`);
            continue;
        };

        stat.id = foundStat.id;
        stat.text = foundStat.text;

        const numbers = line.match(/[+-]?\d+(\.\d+)?/g);

        if (numbers && numbers.length > 1) {
            stat.values = { min: parseFloat(numbers[0]), max: parseFloat(numbers[1]) };
        } else if (numbers && numbers.length === 1) {
            stat.values = { min: parseFloat(numbers[0]) };
        }

        stats.push(stat);
    }

    return stats;
}
