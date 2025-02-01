import { GameDescription } from "../constants";
import { extractInteger, findBlockWithLine } from "../helpers";
import { Item } from "../searchv2";
import { InputData } from "../types";

export function parseArmour(inputData: InputData, item: Item) {
    const allowedClassId = ['armour'];

    if (!allowedClassId.includes(item.header?.category ?? '')) {
        return null;
    }

    const armourBlock = findBlockWithLine(inputData, 'Armour:');
    if (!armourBlock) {
        return null;
    }

    const armourLine = armourBlock.lines.find(line => line.text.includes(GameDescription.armour))!;

    if (armourLine) {
        armourLine.parsed = true;
    }

    return extractInteger(GameDescription.armour, armourBlock.lines.map(line => line.text));
}