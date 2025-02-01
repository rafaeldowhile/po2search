import { GameDescription } from "../constants";
import { findBlockWithLine, extractInteger } from "../helpers";
import { Item } from "../searchv2";
import { InputData } from "../types";

export function parseQuantity(inputData: InputData, item: Item) {
    const allowedClassId = ['map'];

    if (!allowedClassId.includes(item.header?.category ?? '')) {
        return null;
    }

    const quantityBlock = findBlockWithLine(inputData, GameDescription.quantity);
    if (!quantityBlock) {
        return null;
    }

    const quantityLine = quantityBlock.lines.find(line => line.text.includes(GameDescription.quantity))!;
    if (quantityLine) {
        quantityLine.parsed = true;
    }

    return extractInteger(GameDescription.quantity, quantityBlock.lines.map(line => line.text));
}
