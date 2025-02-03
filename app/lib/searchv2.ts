import { parseInput } from "./helpers";
import { Item } from "./models/item";
import { itemToQuery } from "./parsers/api/item-to-query";
import { parseAreaLevel } from "./parsers/area-level";
import { parseArmour } from "./parsers/armour";
import { parseAttackSpeed } from "./parsers/attack-speed";
import { parseBlightRavaged } from "./parsers/blight-ravaged";
import { parseBlighted } from "./parsers/blighted";
import { parseBlock } from "./parsers/block";
import { parseCorrupted } from "./parsers/corrupted";
import { parseCriticalHitChance } from "./parsers/critical-hit-chance";
import { parseEnergyShield } from "./parsers/energy-shield";
import { parseEvasion } from "./parsers/evasion";
import { parseGemLevel } from "./parsers/gem";
import { parserHeader } from "./parsers/header";
import { parseItemLevel } from "./parsers/item-level";
import { parseItemRarity } from "./parsers/item-rarity";
import { parseMapTier } from "./parsers/map";
import { parseMods } from "./parsers/mods";
import { parseMonsterPackSize } from "./parsers/moster-pack-size";
import { parseQuality } from "./parsers/quality";
import { parseQuantity } from "./parsers/quantity";
import { parserRequirements } from "./parsers/requirements";
import { parserSockets } from "./parsers/sockets";
import { parseUnidentified } from "./parsers/unidentified";
import { parseWeaponDamage } from "./parsers/weapon-damage";
import { DamageRange, InputData, ModLine, QueryOptions } from "./types";

export type ItemProperties = {
    quality: number | null;
    armour: number | null;
    evasion: number | null;
    energyShield: number | null;
    block: number | null;
    attackSpeed: number | null;
    criticalHitChance: number | null;
    quantity: number | null;
    itemRarity: number | null;
    monsterPackSize: number | null;
    blighted: boolean | null;
    blightRavaged: boolean | null;
    mapTier: number | null;
    areaLevel: number | null;
    gemLevel: number | null;
    itemLevel: number | null;
    corrupted: boolean | null;
    unidentified: boolean | null;
    physicalDamage?: DamageRange;
    fireDamage?: DamageRange;
    coldDamage?: DamageRange;
    lightningDamage?: DamageRange;
    chaosDamage?: DamageRange;
    elementalDamage?: DamageRange;
}



function parserProperties(inputData: InputData, item: Item) {
    const quality = parseQuality(inputData, item);
    const armour = parseArmour(inputData, item);
    const evasion = parseEvasion(inputData, item);
    const energyShield = parseEnergyShield(inputData, item);
    const block = parseBlock(inputData, item);

    const attackSpeed = parseAttackSpeed(inputData, item);
    const criticalHitChance = parseCriticalHitChance(inputData, item);
    const quantity = parseQuantity(inputData, item);
    const itemRarity = parseItemRarity(inputData, item);
    const monsterPackSize = parseMonsterPackSize(inputData, item);
    const blighted = parseBlighted(inputData, item);
    const blightRavaged = parseBlightRavaged(inputData, item);
    const mapTier = parseMapTier(inputData, item);
    const areaLevel = parseAreaLevel(inputData, item);
    const gemLevel = parseGemLevel(inputData, item);
    const itemLevel = parseItemLevel(inputData, item);
    const corrupted = parseCorrupted(inputData);
    const unidentified = parseUnidentified(inputData);

    return {
        quality,
        armour,
        evasion,
        energyShield,
        block,
        attackSpeed,
        criticalHitChance,
        quantity,
        itemRarity,
        monsterPackSize,
        blighted,
        blightRavaged,
        mapTier,
        areaLevel,
        gemLevel,
        itemLevel,
        corrupted,
        unidentified,
    }
}

async function parseItemData(inputData: InputData) {
    const item = new Item();
    const header = parserHeader(inputData);
    item.header = header;
    const sockets = parserSockets(inputData);
    item.sockets = sockets;
    const requirements = parserRequirements(inputData);
    item.requirements = requirements;
    const properties = parserProperties(inputData, item);
    item.properties = properties;
    const mods = await parseMods(inputData, item);
    item.mods = mods;
    parsePropertiesAfterMods(inputData, item, mods);

    return item;
}

function parsePropertiesAfterMods(inputData: InputData, item: Item, mods: ModLine[]) {
    if (item.header?.category === 'weapon') {
        const weaponDamage = parseWeaponDamage(inputData, item, mods);
        if (weaponDamage) {
            item.properties = {
                ...item.properties as ItemProperties,
                ...weaponDamage
            };
        }
    }
}

export function inputToItem(input: string) {
    const inputData = parseInput(input);
    return parseItemData(inputData);
}

export function getPoeQuery(item: Item, queryOptions: QueryOptions) {
    return itemToQuery(item, queryOptions);
}