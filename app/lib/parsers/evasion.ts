import { GameDescription } from "../constants";
import { extractInteger, findBlockWithLine } from "../helpers";
import { Item } from "../models/item";
import { InputData } from "../types";

export function parseEvasion(inputData: InputData, item: Item) {
    const allowedClassId = ['armour'];

    if (!allowedClassId.includes(item.header?.category ?? '')) {
        return null;
    }

    const evasionBlock = findBlockWithLine(inputData, GameDescription.evasion);

    if (!evasionBlock) {
        return null;
    }

    const evasionLine = evasionBlock.lines.find(line => line.text.includes(GameDescription.evasion))!;
    if (evasionLine) {
        evasionLine.parsed = true;
    }

    return extractInteger(GameDescription.evasion, evasionBlock.lines.map(line => line.text));
}