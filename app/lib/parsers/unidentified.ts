import { GameDescription } from "../constants";
import { InputData } from "../types";

export function parseUnidentified(inputData: InputData) {
    const unidentifiedBlock = inputData.blocks.find(block => 
        block.lines.some(line => line.text.includes(GameDescription.unidentified))
    );

    if (!unidentifiedBlock) {
        return false;
    }

    const unidentifiedLine = unidentifiedBlock.lines.find(line => line.text.includes(GameDescription.unidentified))!;
    unidentifiedLine.parsed = true;

    return true;
}