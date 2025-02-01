import { extractFloat, extractInteger } from "./helpers";
import { GENERAL_DESCRIPTIONS } from "./i18n/en";
import { ParsedEquipment, ParsedItem } from "./types";


function armour(lines: string[]): number | null {
    return extractInteger(GENERAL_DESCRIPTIONS.descriptionArmour, lines);
}

function evasion(lines: string[]): number | null {
    return extractInteger(GENERAL_DESCRIPTIONS.descriptionEvasion, lines);
}

function energyShield(lines: string[]): number | null {
    return extractInteger(GENERAL_DESCRIPTIONS.descriptionEnergyShield, lines);
}

function blockChance(lines: string[]): number | null {
    return extractInteger(GENERAL_DESCRIPTIONS.descriptionBlockChance, lines);
}

function attacksPerSecond(lines: string[]): number | null {
    return extractFloat(GENERAL_DESCRIPTIONS.descriptionAttacksPerSecond, lines);
}

function criticalStrikeChance(lines: string[]): number | null {
    return extractFloat(GENERAL_DESCRIPTIONS.descriptionCriticalStrikeChance, lines);
}

export function extractEquipment(lines: string[], parsed: ParsedItem): ParsedEquipment {

    const equipment: ParsedEquipment = {
        damage: {
            min: null,
            max: null
        },
        aps: attacksPerSecond(lines),
        dps: null,
        edps: null,
        block: blockChance(lines),
        rune_sockets: null,
        spirit: null,
        es: energyShield(lines),
        ar: armour(lines),
        pdps: null,
        crit: criticalStrikeChance(lines)
    };

    return equipment;
}