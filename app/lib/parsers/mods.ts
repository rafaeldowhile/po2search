import Fuse from 'fuse.js';
import statsData from '../../data/stats.json';
import { GameDescription } from '../constants';
import { removeSquareBrackets, replaceNumbersWithHash } from '../helpers';
import { Item } from "../models/item";
import { InputData, ModLine, SearchModResult } from "../types";

interface StatEntry {
    id: string;
    text: string;
    type: 'explicit' | 'implicit' | 'rune' | 'crafted' | 'enchant';
}

const fuseOptions = {
    keys: ['text', 'type'],
    threshold: 0.15,
    includeScore: true,
};

const allStats = statsData.result.flatMap(category =>
    category.entries.map(entry => ({
        id: entry.id,
        text: entry.text,
        type: entry.type,
    } as StatEntry))
);

const fuseIndex = Fuse.createIndex(fuseOptions.keys, allStats);
const fuse = new Fuse(allStats, fuseOptions, fuseIndex);

export function parseMods(inputData: InputData, item: Item) {
    let lines = inputData.blocks.flatMap(block => block.lines.filter(line => !line.parsed));
    lines = lines.filter(line =>
        ![
            `${GameDescription.damageTypes.physical}:`,
            `${GameDescription.damageTypes.chaos}:`,
            `${GameDescription.damageTypes.elemental}:`,
            `${GameDescription.damageTypes.fire}:`,
            `${GameDescription.damageTypes.cold}:`,
            `${GameDescription.damageTypes.lightning}:`
        ].some(pattern => line.text.includes(pattern))
    );

    const modsPromises = lines.map(async line => {
        line.text = removeSquareBrackets(line.text)
        const suffix = extractSuffix(line.text);
        const simpleSearchResult = simpleSearch(line.text, suffix);

        let mod: ModLine = {
            text: line.text,
            mods: []
        };

        if (simpleSearchResult) {
            mod.mods = simpleSearchResult;
        } else {
            const fuseSearchResult = fuseSearch(line.text, suffix);
            if (fuseSearchResult) {
                mod.mods = fuseSearchResult;
            }
        }

        if (mod) {
            const numbers = resolveNumbers(mod.text);
            line.parsed = true;
            return { ...mod, ...numbers };
        }
        return null;
    });

    return Promise.all(modsPromises).then(results => results.filter(Boolean) as ModLine[]);
}

function simpleSearch(line: string, suffix: keyof typeof GameDescription.suffixesRegex): SearchModResult[] | null {
    const patternLine = replaceNumbersWithHash(line);
    const cleanLine = cleanUpSuffix(patternLine, suffix);
    const result = allStats.filter(stat => stat.text === cleanLine && stat.type === suffix);
    if (result.length > 0) {
        return result.map(stat => ({
            id: stat.id,
            text: line,
            pattern: stat.text,
            type: stat.type,
        }))
    }
    return null;
}

function cleanUpSuffix(text: string, suffix: keyof typeof GameDescription.suffixesRegex) {
    const regex = new RegExp(`\\s*${GameDescription.suffixesRegex[suffix]}\\s*$`, 'i');
    return text.replace(regex, '').trim();
}

function fuseSearch(line: string, suffix: keyof typeof GameDescription.suffixesRegex): SearchModResult[] | null {
    const patternLine = replaceNumbersWithHash(line);
    const searchResults = fuse.search({
        $and: [
            { text: patternLine },
            { type: suffix }
        ]
    });

    if (searchResults.length > 0) {
        return searchResults.map(result => ({
            id: result.item.id,
            pattern: result.item.text,
            text: line,
            type: result.item.type,
        }))
    }

    return null;
}

function extractSuffix(text: string): keyof typeof GameDescription.suffixesRegex {
    for (const [suffix, regex] of Object.entries(GameDescription.suffixesRegex)) {
        const regexObj = new RegExp(regex, 'i');
        if (regexObj.test(text)) {
            return suffix as keyof typeof GameDescription.suffixesRegex;
        }
    }

    return 'explicit';
}

function resolveNumbers(text: string) {
    const match = text.match(/-?\d+(\.\d+)?/g);
    if (match) {
        if (match.length === 1) {
            return {
                value: parseFloat(match[0]),
                range: null
            }
        } else if (match.length === 2) {
            return {
                value: null,
                range: {
                    min: parseFloat(match[0]),
                    max: parseFloat(match[1])
                }
            }
        }
    }
    return {
        value: null,
        range: null
    }
}