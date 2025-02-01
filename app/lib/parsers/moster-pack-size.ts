import { GameDescription } from "../constants";
import { extractInteger, findBlockWithLine } from "../helpers";
import { Item } from "../searchv2";
import { InputData } from "../types";

export function parseMonsterPackSize(inputData: InputData, item: Item) {
    const allowedClassId = ['map'];

    if (!allowedClassId.includes(item.header?.category ?? '')) {
        return null;
    }

    const packSizeBlock = findBlockWithLine(inputData, GameDescription.monsterPackSize);
    if (!packSizeBlock) {
        return null;
    }

    const packSizeLine = packSizeBlock.lines.find(line => line.text.includes(GameDescription.monsterPackSize))!;
    if (packSizeLine) {
        packSizeLine.parsed = true;
    }

    return extractInteger(GameDescription.monsterPackSize, packSizeBlock.lines.map(line => line.text));
}