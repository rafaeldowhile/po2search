import { GameDescription } from "../constants";
import { findBlockWithLine, extractInteger } from "../helpers";
import { Item } from "../models/item";
import { InputData } from "../types";

export function parseEnergyShield(inputData: InputData, item: Item) {
    const allowedClassId = ['armour'];

    if (!allowedClassId.includes(item.header?.category ?? '')) {
        return null;
    }

    const energyShieldBlock = findBlockWithLine(inputData, GameDescription.energyShield);
    if (!energyShieldBlock) {
        return null;
    }

    const energyShieldLine = energyShieldBlock.lines.find(line => line.text.includes(GameDescription.energyShield))!;
    if (energyShieldLine) {
        energyShieldLine.parsed = true;
    }

    return extractInteger(GameDescription.energyShield, energyShieldBlock.lines.map(line => line.text));
}
