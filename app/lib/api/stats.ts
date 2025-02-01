import statsData from '../../data/stats.json';
import { escapeTextWithRegex, removeSquareBrackets } from "../helpers";
import { ModCategory, ModCategorySuffix, ModCategorySuffixRegex, ModPattern } from '../types';

const NEW_LINE_PATTERN_ESCAPED = /(?:\\)*[\r\n]+/g;
const PARSE_HASH_PATTERN = /\#/g;
const PARENTHESES_PATTERN = /((?:\\ )*\\\([^\(\)]*\\\))/g;

const resolveOptionText = (text: string, optionText: string): string => {

    const optionLines: string[] = [];

    for (const optionLine of optionText.split(NEW_LINE_PATTERN_ESCAPED)) {
        optionLines.push(text.replace(PARSE_HASH_PATTERN, optionLine));
    }

    return optionLines.join('\n').trim();
}

const resolveFuseText = ({
    category, text, optionText
}: {
    category: ModCategory, text: string, optionText?: string
}) => {
    text = removeSquareBrackets(text)
    if (optionText) {
        optionText = removeSquareBrackets(optionText)
    }

    let fuseText = text;
    if (optionText) {
        for (const line of optionText.split(NEW_LINE_PATTERN_ESCAPED)) {
            if (fuseText.match(PARSE_HASH_PATTERN)) {
                fuseText = fuseText.replace(PARSE_HASH_PATTERN, line);
            } else {
                fuseText += line;
            }
        }
    }

    fuseText += ModCategorySuffix[category]

    return cleanUpFuseText(fuseText)
}

const cleanUpFuseText = (text: string | null): string | null => {
    if (!text) {
        return text;
    }

    const cleanFuzzyPattern = /[-+0-9%#]/g;
    const trimPattern = /\s+/g;

    text = text.replace(cleanFuzzyPattern, '');
    text = text.replace(trimPattern, ' ').trim();

    return text;
}


const resolvePattern = ({
    category, text, optionText
}: {
    category: ModCategory, text: string, optionText?: string
}) => {

    text = removeSquareBrackets(text)
    if (optionText) {
        optionText = removeSquareBrackets(optionText)
    }
    const suffix = ModCategorySuffixRegex[category]

    let patternValue = escapeTextWithRegex(text)
    patternValue = patternValue.replace(PARENTHESES_PATTERN, '(?:$1)?');
    patternValue = patternValue.replace(NEW_LINE_PATTERN_ESCAPED, '\\n');

    if (!optionText) {
        patternValue = patternValue.replace(PARSE_HASH_PATTERN, '[-+0-9,.]+') + suffix;
    } else {
        const optionLines = optionText.split('\n').map(optionLine => {
            return patternValue.replace(PARSE_HASH_PATTERN, optionLine.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')) + suffix;
        });
        patternValue = optionLines.join('\n');
    }

    return new RegExp(`^${patternValue}$`);
}

const resolvePatterns = (apiCategory: typeof statsData.result[0], modCategory: string): ModPattern[] => {
    if (apiCategory.entries.length === 0 || !modCategory) return []

    const patterns: ModPattern[] = []

    for (const entry of apiCategory.entries) {
        entry.text = removeSquareBrackets(entry.text)

        //@ts-ignore
        const options = entry.option?.options ?? []
        if (options.length > 0) {
            for (const option of options) {
                const text = option.text ? removeSquareBrackets(option.text) : null
                if (!text) continue
                patterns.push({
                    category: modCategory as ModCategory,
                    id: entry.id,
                    isOption: options.length > 1,
                    text: resolveOptionText(entry.text, option.text),
                    fuseText: resolveFuseText({
                        category: modCategory as ModCategory,
                        text: entry.text,
                        optionText: option.text
                    }),
                    pattern: resolvePattern({
                        category: modCategory as ModCategory,
                        text: entry.text,
                        optionText: option.text
                    })
                })
            }
        } else {
            patterns.push({
                category: modCategory as ModCategory,
                id: entry.id,
                isOption: false,
                text: entry.text,
                fuseText: resolveFuseText({
                    category: modCategory as ModCategory,
                    text: entry.text
                }),
                pattern: resolvePattern({
                    category: modCategory as ModCategory,
                    text: entry.text
                })
            })
        }
    }

    return patterns
}

interface Pattern {
    category: ModCategory,
    patterns: ModPattern[]
}

const preparePatterns = () => {
    const allPatterns: Pattern[] = []
    for (const apiCategory of statsData.result) {
        const modCategory = apiCategory.entries[0].type
        const patterns = resolvePatterns(apiCategory, modCategory)
        allPatterns.push({
            category: modCategory as ModCategory,
            patterns
        })
    }

    return allPatterns
}

const Patterns = preparePatterns()

export default Patterns
