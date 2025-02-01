import { GameDescription } from "../constants";
import { Item, ItemProperties } from "../searchv2";
import { InputData, Mod, ModLine, WeaponDamageProperties } from "../types";
import statsData from '../../data/stats.json';

const loadDamageModsIds = () => {
    const fireIds: string[] = [];
    const coldIds: string[] = [];
    const lightningIds: string[] = [];

    for (const category of statsData.result) {
        for (const entry of category.entries) {
            if (entry.text.includes(GameDescription.damageTypes.firePattern)) {
                fireIds.push(entry.id);
            }
            if (entry.text.includes(GameDescription.damageTypes.coldPattern)) {
                coldIds.push(entry.id);
            }
            if (entry.text.includes(GameDescription.damageTypes.lightningPattern)) {
                lightningIds.push(entry.id);
            }
        }
    }

    return { fireIds, coldIds, lightningIds };
}

const { fireIds, coldIds, lightningIds } = loadDamageModsIds();

export function parseWeaponDamage(inputData: InputData, item: Item, mods: ModLine[]): WeaponDamageProperties | null {
    const propertyBlock = inputData.blocks[1];
    if (!propertyBlock) return null;

    const { properties } = item;

    if (!properties) return null;

    for (const line of propertyBlock.lines) {
        const isElemental = line.text.startsWith(`${GameDescription.damageTypes.elemental}:`);
        if (isElemental) {
            const elementalDamages = parseElementalDamages(line.text, mods);
            if (properties) {
                Object.assign(properties, elementalDamages);
            }
            continue
        }

        const isPhysical = line.text.startsWith(`${GameDescription.damageTypes.physical}:`);
        const isChaos = line.text.startsWith(`${GameDescription.damageTypes.chaos}:`);
        const isCold = line.text.startsWith(`${GameDescription.damageTypes.cold}:`);
        const isFire = line.text.startsWith(`${GameDescription.damageTypes.fire}:`);
        const isLightning = line.text.startsWith(`${GameDescription.damageTypes.lightning}:`);

        if (!isPhysical && !isChaos && !isFire && !isCold && !isLightning) {
            continue;
        }

        const matches = line.text.match(/(\d+)-(\d+)/);
        if (!matches || matches.length < 3) continue;

        const min = parseInt(matches[1]);
        const max = parseInt(matches[2]);
        const range = { min, max };

        if (isPhysical) properties.physicalDamage = range;
        if (isChaos) properties.chaosDamage = range;
        if (isFire) properties.fireDamage = range;
        if (isCold) properties.coldDamage = range;
        if (isLightning) properties.lightningDamage = range;
    }

    return properties;
}

function parseElementalDamages(text: string, mods: ModLine[]): Partial<ItemProperties> {
    const properties: Partial<ItemProperties> = {};

    // Combine all damage mod IDs
    const damageMods = [...fireIds, ...coldIds, ...lightningIds];

    // Filter mods that have damage modifiers
    const itemMods = mods.filter(mod =>
        mod.mods.some(modifier => damageMods.includes(modifier.id))
    );

    // Get all damage ranges from the text
    const matches = Array.from(text.matchAll(/(\d+)-(\d+)/g));

    for (let i = 0; i < matches.length && i < itemMods.length; i++) {
        const match = matches[i];
        const itemMod = itemMods[i];

        if (!match || match.length < 3) continue;

        const min = parseInt(match[1]);
        const max = parseInt(match[2]);
        const range = { min, max };

        // Get all modifier IDs for current mod
        const modifierIds = itemMod.mods
            .map(modifier => modifier.id)
            .filter((id): id is string => id !== undefined);

        // Check damage type and assign to properties
        if (fireIds.some(id => modifierIds.includes(id))) {
            properties.fireDamage = range;
        } else if (coldIds.some(id => modifierIds.includes(id))) {
            properties.coldDamage = range;
        } else if (lightningIds.some(id => modifierIds.includes(id))) {
            properties.lightningDamage = range;
        }
    }

    return properties;
} 