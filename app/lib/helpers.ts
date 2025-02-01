import { stringSimilarity } from "string-similarity-js";
import categoriesData from '~/data/type_filters/categories.json';
import { MANUAL_CATEGORY_MAPPING } from "./constants";
import { InputData, InputDataItemLine } from "./types";

export function getValueFromTextKey(inputData: string[], text: string): string | null {
    const line = inputData.find(line =>
        line.toLowerCase().includes(text.toLowerCase())
    );

    if (!line) return null;

    return line.substring(line.toLowerCase().indexOf(text.toLowerCase()) + text.length).trim();
}

export function extractInteger(text: string, lines: string[]): number | null {
    const line = lines.find(line => line.toLowerCase().includes(text.toLowerCase()));
    if (!line) return null;

    const numbers = line.match(/[+-]?\d+(\.\d+)?/g);
    if (!numbers || numbers.length === 0) return null;

    return parseInt(numbers[0]);
}

export function extractFloat(text: string, lines: string[]): number | null {
    const line = lines.find(line => line.toLowerCase().includes(text.toLowerCase()));
    if (!line) return null;

    const numbers = line.match(/[+-]?\d+(\.\d+)?/g);
    if (!numbers || numbers.length === 0) return null;

    return parseFloat(numbers[0]);
}

export function normalizeStatText(text: string): string {
    return text.replace(/[+-]?\d+(\.\d+)?(%)?/g, match => match.endsWith('%') ? '#%' : '#');
}

export const findBlockWithLine = (inputData: InputData, line: string) => {
    return inputData.blocks.find(block => block.lines.some(blockLine => blockLine.text.includes(line)));
}

export const findLine = (inputData: InputData, line: string): InputDataItemLine | null => {
    return inputData.blocks.find(block => block.lines.some(blockLine => blockLine.text.includes(line)))?.lines.find(blockLine => blockLine.text.includes(line)) ?? null;
}

const numberPattern = /[-]?\d+\.?\d*(?:[-]\d+\.?\d*)*/g;
export const replaceNumbersWithHash = (text: string): string => {
    return text.replace(numberPattern, (match) => {
        return match.includes('-') ? '#-#' : '#';
    });
};

const SQUARE_BRACKET_PATTERN = /\[(.*?\|)?([^\|\[\]]*)\]/g;
export function removeSquareBrackets(text: string): string {
    if (!text) return text;
    return text.replace(SQUARE_BRACKET_PATTERN, '$2');
}

export function escapeTextWithRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseInput(input: string): InputData {
    const ITEM_SEPARATOR = '--------';

    const blocks = input.split(ITEM_SEPARATOR)
        .map(block => block.trim());

    return {
        blocks: blocks.map(block => ({
            lines: block.split('\n').map(line => ({
                text: line.trim(),
                parsed: false
            }))
        }))
    };
}

export function getCategory(value: string): string {
    if (!value) {
        throw new Error('No Item Class found in input');
    }

    const manualCategory = MANUAL_CATEGORY_MAPPING[value];
    if (manualCategory) {
        return manualCategory;
    }

    const normalizedValue = value.toLowerCase();

    const category = categoriesData.reduce<{ category: any; similarity: number } | null>((closest, current) => {
        const similarity = stringSimilarity(
            normalizedValue,
            current.text.toLowerCase()
        );

        if (!closest || similarity > closest.similarity) {
            return { category: current, similarity: similarity };
        }
        return closest;
    }, null);

    if (category && category.similarity >= 0.7) {
        return category.category.id;
    }

    throw new Error(`Could not find matching category for: ${value}`);
}