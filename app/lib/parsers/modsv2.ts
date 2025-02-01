import Patterns from "../api/stats";
import { Item } from "../searchv2";
import { InputData, InputDataItem, InputDataItemLine, ModPattern } from "../types";


const MOD_TYPE_REGEX = /\s*\((rune|implicit|enchant|crafted|veiled|fractured|scourge|crucible)\)\s*$/i;


interface Mod {

}

interface ModLine {
    text: string,
    mods: Mod[]
}

export async function parseMods(inputData: InputData, item: Item) {
    if (['card', 'gem'].includes(item.header?.category ?? '')) return []



}

function matchModifiers(inputData: InputData) {
    for (const block of inputData.blocks.filter(block => block.lines.some(line => !line.parsed))) {
        for (let lineIndex = 0; lineIndex < block.lines.length; lineIndex++) {
            const line = block.lines[lineIndex]
            if (line.parsed) continue

            let patterns = matchPatterns(block, line, lineIndex)
            if (!patterns.length) {
                patterns = matchModifierFuse(line)
            }
        }
    }
}

function matchPatterns(block: InputDataItem, line: InputDataItemLine, lineIndex: number) {
    const matches: ModPattern[] = [];

    // Flatten all patterns from different categories
    const allPatterns = Patterns.flatMap(category => category.patterns);

    for (const pattern of allPatterns) {
        // For single line patterns
        if (pattern.pattern.test(line.text)) {
            matches.push(pattern);
            continue;
        }

        // For multiline patterns - join remaining lines and test
        const lineCount = pattern.text.split('\n').length;
        if (lineCount > 1) {
            const remainingLines = block.lines
                .slice(lineIndex, lineIndex + lineCount)
                .map(l => l.text)
                .join('\n');

            if (pattern.pattern.test(remainingLines)) {
                matches.push(pattern);
            }
        }
    }

    return matches;
}

function matchModifierFuse(line: InputDataItemLine) {

}