import { GameDescription } from "../constants";
import { getCategory } from "../helpers";
import { BroaderCategory, InputData, Rarity } from "../types";

export function parserHeader(inputData: InputData) {
    const headerLines = inputData.blocks[0];
    if (!headerLines || !headerLines.lines.some(line => line.text.includes(GameDescription.itemClass))) {
        // TODO: Fix it to allow gem
        throw new Error('Not a valid item');
    }

    const itemClassLine = headerLines.lines.find(line => line.text.includes(GameDescription.itemClass))!;
    const itemClassDescription = itemClassLine.text.split(':')[1].trim();
    const itemClassId = getCategory(itemClassDescription);
    const category = itemClassId.split('.')[0] as BroaderCategory;
    itemClassLine.parsed = true;
    const rarityLine = headerLines.lines.find(line => line.text.includes(GameDescription.rarity))!;
    const rarityDescription = rarityLine.text.split(':')[1].trim();
    const rarityId: Rarity = rarityDescription.toLowerCase() as Rarity;
    rarityLine.parsed = true;
    
    if(headerLines.lines[2]) {
        headerLines.lines[2].parsed = true;
    }
    if(headerLines.lines[3]) {
        headerLines.lines[3].parsed = true;
    }

    return {
        itemClassId,
        rarityId,
        category,
        name: headerLines.lines[2]?.text,
        type: headerLines.lines[3]?.text,
    }
}