import { findBlockWithLine } from "../helpers";
import { GameDescription } from "../constants";
import { extractInteger } from "../helpers";
import { InputData } from "../types";
import { Item } from "../searchv2";

export const parseItemLevel = (inputData: InputData, item: Item) => {
    const itemLevelBlock = findBlockWithLine(inputData, GameDescription.itemLevel);
    if (!itemLevelBlock) {
        return null;
    }

    const itemLevelLine = itemLevelBlock.lines.find(line => line.text.includes(GameDescription.itemLevel))!;
    if (itemLevelLine) {
        itemLevelLine.parsed = true;
    }

    return extractInteger(GameDescription.itemLevel, itemLevelBlock.lines.map(line => line.text));
}
