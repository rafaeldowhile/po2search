import { GameDescription } from "../constants";
import { findBlockWithLine, extractInteger } from "../helpers";
import { Item } from "../models/item";
import { InputData } from "../types";

export function parseAreaLevel(inputData: InputData, item: Item) {
    const allowedClassId = ['map', 'contract'];

    if (!allowedClassId.includes(item.header?.category ?? '')) {
        return null;
    }

    const areaLevelBlock = findBlockWithLine(inputData, GameDescription.areaLevel);
    if (!areaLevelBlock) {
        return null;
    }

    const areaLevelLine = areaLevelBlock.lines.find(line => line.text.includes(GameDescription.areaLevel))!;
    if (areaLevelLine) {
        areaLevelLine.parsed = true;
    }

    return extractInteger(GameDescription.areaLevel, areaLevelBlock.lines.map(line => line.text));
}