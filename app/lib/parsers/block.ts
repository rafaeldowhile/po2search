import { GameDescription } from "../constants";
import { extractInteger, findBlockWithLine } from "../helpers";
import { Item } from "../models/item";
import { InputData } from "../types";

export function parseBlock(inputData: InputData, item: Item) {
    const allowedClassId = ['armour'];

    if (!allowedClassId.includes(item.header?.category ?? '')) {
        return null;
    }

    const blockBlock = findBlockWithLine(inputData, GameDescription.block);
    if (!blockBlock) {
        return null;
    }

    const blockLine = blockBlock.lines.find(line => line.text.includes(GameDescription.block))!;
    if (blockLine) {
        blockLine.parsed = true;
    }

    return extractInteger(GameDescription.block, blockBlock.lines.map(line => line.text));
}