import { GameDescription } from "../constants";
import { extractFloat, findBlockWithLine } from "../helpers";
import { Item } from "../searchv2";
import { InputData } from "../types";

export function parseCriticalHitChance(inputData: InputData, item: Item) {
    const allowedClassId = ['weapon'];

    if (!allowedClassId.includes(item.header?.category ?? '')) {
        return null;
    }

    const criticalHitChanceBlock = findBlockWithLine(inputData, GameDescription.criticalHitChance);
    if (!criticalHitChanceBlock) {
        return null;
    }

    const criticalHitChanceLine = criticalHitChanceBlock.lines.find(line => line.text.includes(GameDescription.criticalHitChance))!;
    if (criticalHitChanceLine) {
        criticalHitChanceLine.parsed = true;
    }

    return extractFloat(GameDescription.criticalHitChance, criticalHitChanceBlock.lines.map(line => line.text));
}
