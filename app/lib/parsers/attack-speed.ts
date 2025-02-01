import { GameDescription } from "../constants";
import { extractFloat, findBlockWithLine } from "../helpers";
import { Item } from "../searchv2";
import { InputData } from "../types";


export function parseAttackSpeed(inputData: InputData, item: Item) {
    const allowedClassId = ['weapon'];

    if (!allowedClassId.includes(item.header?.category ?? '')) {
        return null;
    }

    const attackSpeedBlock = findBlockWithLine(inputData, GameDescription.attackSpeed);
    if (!attackSpeedBlock) {
        return null;
    }

    const attackSpeedLine = attackSpeedBlock.lines.find(line => line.text.includes(GameDescription.attackSpeed))!;
    if (attackSpeedLine) {
        attackSpeedLine.parsed = true;
    }

    return extractFloat(GameDescription.attackSpeed, attackSpeedBlock.lines.map(line => line.text));
}