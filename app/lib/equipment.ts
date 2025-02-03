import { GameDescription } from "./constants";
import { extractFloat, extractInteger } from "./helpers";
import { ParsedEquipment, ParsedItem } from "./types";


function armour(lines: string[]): number | null {
    return extractInteger(GameDescription.armour, lines);
}

function evasion(lines: string[]): number | null {
    return extractInteger(GameDescription.evasion, lines);
}

function energyShield(lines: string[]): number | null {
    return extractInteger(GameDescription.energyShield, lines);
}

function blockChance(lines: string[]): number | null {
    return extractInteger(GameDescription.block, lines);
}

function attacksPerSecond(lines: string[]): number | null {
    return extractFloat(GameDescription.attackSpeed, lines);
}

function criticalStrikeChance(lines: string[]): number | null {
    return extractFloat(GameDescription.criticalHitChance, lines);
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
        ev: evasion(lines),
        pdps: null,
        crit: criticalStrikeChance(lines)
    };

    return equipment;
}