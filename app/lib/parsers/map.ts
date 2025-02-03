import { GameDescription } from "../constants";
import { extractInteger, findBlockWithLine } from "../helpers";
import { Item } from "../models/item";
import { InputData } from "../types";

export function parseMapTier(inputData: InputData, item: Item) {
    const allowedClassId = ['map'];

    if (!allowedClassId.includes(item.header?.category ?? '')) {
        return null;
    }

    const mapTierBlock = findBlockWithLine(inputData, GameDescription.mapTier);
    if (!mapTierBlock) {
        return null;
    }

    const mapTierLine = mapTierBlock.lines.find(line => line.text.includes(GameDescription.mapTier))!;
    if (mapTierLine) {
        mapTierLine.parsed = true;
    }

    return extractInteger(GameDescription.mapTier, mapTierBlock.lines.map(line => line.text));
}