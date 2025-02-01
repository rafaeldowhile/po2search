import { parseInput } from "./helpers";
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
import { POE2Query } from "./poe2-query-schema";
import { InputData, ItemHeader, ItemRequirements, Mod, ModLine, ParsedItem } from "./types";

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
    physicalDamage?: { min: number; max: number };
    fireDamage?: { min: number; max: number };
    coldDamage?: { min: number; max: number };
    lightningDamage?: { min: number; max: number };
    chaosDamage?: { min: number; max: number };
    elementalDamage?: { min: number; max: number };
}

export class Item {
    public header: ItemHeader | null = null;
    public sockets: string[] | null = null;
    public requirements: ItemRequirements | null = null;
    public properties: ItemProperties | null = null;
    public mods: ModLine[] | null = null;
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

function createBaseQuery(parsedItem: ParsedItem): POE2Query {
    console.log(parsedItem);
    throw new Error('Not implemented');
}

interface QueryOptions {
    realm: POE2Query['realm'];
    status: POE2Query['status'];
}

export async function transform(input: string, queryOptions: QueryOptions) {
    const inputData = parseInput(input);
    const parsedItem = await parseItemData(inputData);
    console.log(input)
    console.log(JSON.stringify(parsedItem, null, 2));
    // const query = createBaseQuery(parsedItem);

    // return poe2QuerySchema.parse(query);
}

// Example usage:
const helmet = `
Item Class: Helmets
Rarity: Rare
Dusk Guardian
Advanced Wrapped Greathelm
--------
Quality: +20% (augmented)
Armour: 590 (augmented)
--------
Requirements:
Level: 51
Str: 94
--------
Sockets: S 
--------
Item Level: 58
--------
+12% to Lightning Resistance (rune)
--------
+93 to Armour
70% increased Armour
+40 to Accuracy Rating
+88 to maximum Life
+27% to Fire Resistance
+14% to Cold Resistance
10% increased Light Radius
--------
[Corrupted]`;

const flask = `
Item Class: Life Flasks
Rarity: Magic
Substantial Transcendent Life Flask of the Verdant
--------
Recovers 1369 (augmented) Life over 4 Seconds
Consumes 10 of 75 Charges on use
Currently has 75 Charges
--------
Requirements:
Level: 50
--------
Item Level: 55
--------
63% increased Amount Recovered
Gains 0.20 Charges per Second
--------
Right click to drink. Can only hold charges while in belt. Refill at Wells or by killing monsters.
`

const ring = `
Item Class: Rings
Rarity: Normal
Gold Ring
--------
Requirements:
Level: 40
--------
Item Level: 40
--------
9% increased Rarity of Items found (implicit)
`

const oneHandeMace = `
Item Class: One Hand Maces
Rarity: Unique
Frostbreath
Slim Mace
--------
Quality: +11% (augmented)
Physical Damage: 23-41 (augmented)
Cold Damage: 18-30 (augmented)
Critical Hit Chance: 10.00% (augmented)
Attacks per Second: 1.55
--------
Requirements:
Level: 10
Str: 25
--------
Sockets: S 
--------
Item Level: 18
--------
Adds 6 to 10 Cold Damage (rune)
--------
Adds 10 to 20 Physical Damage
Adds 12 to 20 Cold Damage
+5% to Critical Hit Chance
All Damage from Hits with this Weapon Contributes to Freeze Buildup
Culling Strike against Frozen Enemies
10% of Elemental Damage Converted to Chaos Damage
--------
A merciful murderer swept through the streets of Sarn
Robbing breath from the weak and worthless.
`

const ring2 = `
Item Class: Rings
Rarity: Rare
Rapture Gyre
Breach Ring
--------
Quality (Mana Modifiers): +50% (augmented)
--------
Requirements:
Level: 63 (unmet)
--------
Item Level: 79
--------
Maximum [Quality] is 50% (implicit)
--------
+182 to [Evasion] Rating
+29 to maximum Life
+231 to maximum Mana
15% increased Cast Speed
+40% to [Resistances|Cold Resistance]
93% increased Mana Regeneration Rate
`;

(async () => {
    // const query = await transform(helmet, { realm: 'Standard', status: 'onlineleague' });
    // console.log("#########################")
    // const flaskQuery = await transform(flask, { realm: 'Standard', status: 'onlineleague' });
    // console.log("#########################")
    // const ringQuery = await transform(ring, { realm: 'Standard', status: 'onlineleague' });
    // console.log("#########################")
    const oneHandeMaceQuery = await transform(oneHandeMace, { realm: 'Standard', status: 'onlineleague' });
    // console.log("#########################")
    // const ring2Query = await transform(ring2, { realm: 'Standard', status: 'onlineleague' });
    // console.log("#########################")
})()


