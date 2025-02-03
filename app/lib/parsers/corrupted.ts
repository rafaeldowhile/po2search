import { GameDescription } from "../constants";
import { InputData } from "../types";

export function parseCorrupted(inputData: InputData) {
    const corrruptedBlock = inputData.blocks.find(block => 
        block.lines.some(line => line.text.includes(GameDescription.corrupted))
    );

    if (!corrruptedBlock) {
        return false;
    }

    const corruptedLine = corrruptedBlock.lines.find(line => line.text.toLowerCase().includes(GameDescription.corrupted.toLowerCase()))!;
    corruptedLine.parsed = true;

    return true;
}
