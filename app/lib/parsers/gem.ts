import { GameDescription } from "../constants";
import { extractInteger, findBlockWithLine } from "../helpers";
import { Item } from "../models/item";
import { InputData } from "../types";

export function parseGemLevel(inputData: InputData, item: Item) {
    const allowedClassId = ['gem'];

    if (!allowedClassId.includes(item.header?.category ?? '')) {
        return null;
    }

    const levelBlock = findBlockWithLine(inputData, GameDescription.gemLevel);
    if (!levelBlock) {
        return null;
    }

    const levelLine = levelBlock.lines.find(line => line.text.includes(GameDescription.gemLevel))!;
    if (levelLine) {
        levelLine.parsed = true;
    }

    return extractInteger(GameDescription.gemLevel, levelBlock.lines.map(line => line.text));
}