import { getValueFromTextKey } from "./helpers";
import { ParsedRequirement } from "./types";

export function extractRequirements(lines: string[]): ParsedRequirement {
    const lvl = getValueFromTextKey(lines, 'Level:');
    const dex = getValueFromTextKey(lines, 'Dex:');
    const str = getValueFromTextKey(lines, 'Str:');
    const int = getValueFromTextKey(lines, 'Int:');

    return {
        lvl: lvl ? parseInt(lvl) : null,
        dex: dex ? parseInt(dex) : null,
        str: str ? parseInt(str) : null,
        int: int ? parseInt(int) : null
    };
}