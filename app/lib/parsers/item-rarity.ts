import { GameDescription } from "../constants";
import { extractInteger, findBlockWithLine } from "../helpers";
import { Item } from "../models/item";
import { InputData } from "../types";

export function parseItemRarity(inputData: InputData, item: Item) {
    const allowedClassId = ['map'];

    if (!allowedClassId.includes(item.header?.category ?? '')) {
        return null;
    }

    const rarityBlock = findBlockWithLine(inputData, GameDescription.itemRarity);
    if (!rarityBlock) {
        return null;
    }

    const rarityLine = rarityBlock.lines.find(line => line.text.includes(GameDescription.itemRarity))!;
    if (rarityLine) {
        rarityLine.parsed = true;
    }

    return extractInteger(GameDescription.itemRarity, rarityBlock.lines.map(line => line.text));
}