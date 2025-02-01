import { GameDescription } from "../constants";
import { findBlockWithLine } from "../helpers";
import { InputData, ItemRequirements } from "../types";

export function parserRequirements(inputData: InputData): ItemRequirements | null {
    const requirementsBlock = findBlockWithLine(inputData, 'Requirements:');
    
    if (!requirementsBlock) {
        return null;
    }

    const requirements = requirementsBlock
        .lines
        .slice(1)
        .reduce((acc, requirement) => {
            const line = requirement.text.trim();
            requirement.parsed = true;
            const [key, value] = line.split(':');
            if (!key || !value) return acc;
            return {
                ...acc,
                [key.toLowerCase().trim()]: value.trim()
            };
        }, {} as ItemRequirements);
        
    const reqLine = requirementsBlock.lines.find(line => line.text.includes(GameDescription.requirements))
    
    if (reqLine) {
        reqLine.parsed = true;
    }

    return Object.keys(requirements).length ? requirements : null;
}