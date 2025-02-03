import { GameDescription } from "../constants";
import { extractInteger, findBlockWithLine } from "../helpers";
import { Item } from "../models/item";
import { InputData } from "../types";

export function parseQuality(inputData: InputData, item: Item) {
    const allowedClassId = ['armour', 'weapon', 'accessory', 'flask', 'gem', 'map'];

    if (!allowedClassId.includes(item.header?.category ?? '')) {
        return null;
    }

    const qualityBlock = findBlockWithLine(inputData, 'Quality:');
    if (!qualityBlock) {
        return null;
    }

    const qualityLine = qualityBlock.lines.find(line => line.text.includes(GameDescription.quality))!;
    if (qualityLine) {
        qualityLine.parsed = true;
    }

    return extractInteger(GameDescription.quality, qualityBlock.lines.map(line => line.text));
}
