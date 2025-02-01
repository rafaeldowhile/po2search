export const FILTER_TYPES = {
  EXACT: 'exact',
  RANGE: 'range',
  OPTION: 'option',
  DISABLED: 'disabled'
} as const;

export const RANGE_TYPES = {
  MIN_ONLY: 'min_only',
  MAX_ONLY: 'max_only',
  MIN_MAX: 'min_max',
  EXACT: 'exact'
} as const;

export const FILTER_CONFIG = {
  // ... copy the filter config from search.js
} as const;

export const MANUAL_CATEGORY_MAPPING: { [key: string]: string } = {
  "Staves": "weapon.staff",
  "Staff": "weapon.staff",
  "Foci": "armour.focus",
};

export const GameDescription = {
    itemClass: 'Item Class',
    rarity: 'Rarity',
    level: 'Level',
    quality: 'Quality',
    sockets: 'Sockets',
    requirements: 'Requirements',
    armour: 'Armour',
    evasion: 'Evasion Rating',
    energyShield: 'Energy Shield',
    block: 'Block Chance',
    attackSpeed: 'Attacks per Second',
    criticalHitChance: 'Critical Hit Chance',
    quantity: 'Quantity',
    itemRarity: 'Item Rarity',
    monsterPackSize: 'Monster Pack Size',
    blighted: 'Blighted',
    blightRavaged: 'Blight-ravaged',
    mapTier: 'Map Tier',
    areaLevel: 'Area Level',
    gemLevel: 'Level',
    itemLevel: 'Item Level',
    corrupted: 'Corrupted',
    unidentified: 'Unidentified',
    suffixesRegex: {
        implicit: '\\(implicit\\)',
        explicit: '\\((?:crafted|fractured)?\\)',
        rune: '\\(rune\\)',
        crafted: '\\(crafted\\)', 
        enchant: '\\(enchant\\)',
        veiled: '\\(veiled\\)',
        fractured: '\\(fractured\\)',
        scourge: '\\(scourge\\)',
        crucible: '\\(crucible\\)'
    },
    damageTypes: {
        physical: 'Physical Damage',
        chaos: 'Chaos Damage',
        chaosPattern: 'Adds # to # Chaos Damage',
        elemental: 'Elemental Damage',
        fire: 'Fire Damage',
        firePattern: 'Adds # to # Fire Damage',
        cold: 'Cold Damage',
        coldPattern: 'Adds # to # Cold Damage',
        lightning: 'Lightning Damage',
        lightningPattern: 'Adds # to # Lightning Damage'
    }
} as const;
