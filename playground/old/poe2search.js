const input = `Item Class: Two Hand Maces
Rarity: Rare
Blight Brand
Temple Maul
--------
Physical Damage: 42-86 (augmented)
Fire Damage: 25-43 (augmented)
Critical Hit Chance: 5.00%
Attacks per Second: 1.20
--------
Requirements:
Level: 28
Str: 65
--------
Sockets: S S S 
--------
Item Level: 28
--------
20% increased Physical Damage (rune)
Adds 14 to 22 Fire Damage (rune)
--------
Adds 11 to 21 Fire Damage
+87 to Accuracy Rating
43% increased Elemental Damage with Attacks
+5 to Strength
Gain 5 Life per Enemy Killed
Causes 31% increased Stun Buildup
--------
Corrupted`;

const input2 = `Item Class: Helmets
Rarity: Rare
Pandemonium Halo
Advanced Twig Circlet
--------
Energy Shield: 90 (augmented)
--------
Requirements:
Level: 45
Int: 62 (augmented) (unmet)
--------
Item Level: 45
--------
+27 to maximum Energy Shield
+14 to maximum Life
13% increased Rarity of Items found
25% reduced Attribute Requirements
+19% to Cold Resistance`

import fs from 'fs';
const flatStats = JSON.parse(fs.readFileSync('flatStats.json', 'utf8'));
const typeFilters = JSON.parse(fs.readFileSync('typeFilters.json', 'utf8'));

function normalizeStatText(text) {
    return text.replace(/[+-]?\d+(\.\d+)?(%)?/g, match => match.endsWith('%') ? '#%' : '#');
}

function findStatId(normalizedText) {
    const lowerCaseInput = normalizedText.toLowerCase();
    for (const [id, stat] of Object.entries(flatStats)) {
        if (stat.text.toLowerCase() === lowerCaseInput) {
            return id;
        }
    }
    return null;
}

function parseStatValue(text) {
    const match = text.match(/[+-]?(\d+(\.\d+)?)/g);
    return match ? parseFloat(match[0]) : null;
}

function getCategoryFromItemClass(itemClass) {
    // Load type filters data
    const categoryOptions = typeFilters.filters.find(f => f.id === 'category').option.options;
    
    // Convert item class to lowercase for case-insensitive matching
    const normalizedItemClass = itemClass.toLowerCase();
    
    // Find matching category by comparing item class with category text
    const matchingCategory = categoryOptions.find(option => {
        if (!option.text || option.text === 'Any') return false;
        return normalizedItemClass.includes(option.text.toLowerCase()) ||
               option.text.toLowerCase().includes(normalizedItemClass);
    });

    return matchingCategory ? matchingCategory.id : null;
}

function getRarityFromText(rarityText) {
    // Load rarity options from type filters
    const rarityOptions = typeFilters.filters.find(f => f.id === 'rarity').option.options;
    
    // Convert rarity text to lowercase for case-insensitive matching
    const normalizedRarity = rarityText.toLowerCase();
    
    // Find matching rarity by comparing with option text
    const matchingRarity = rarityOptions.find(option => {
        if (!option.text || option.text === 'Any') return false;
        return option.text.toLowerCase() === normalizedRarity;
    });

    return matchingRarity ? matchingRarity.id : null;
}

function buildTypeFilters(itemClass, rarityText, sections, properties) {
    // Get all available filters from typeFilters schema
    const availableFilters = typeFilters.filters;
    const filters = {};

    // Handle category filter
    const categoryFilter = availableFilters.find(f => f.id === 'category');
    if (categoryFilter) {
        const category = getCategoryFromItemClass(itemClass);
        filters.category = { option: category || "weapon" };
    }

    // Handle rarity filter
    const rarityFilter = availableFilters.find(f => f.id === 'rarity');
    if (rarityFilter) {
        const rarity = getRarityFromText(rarityText) || rarityText.toLowerCase();
        filters.rarity = { option: rarity };
    }

    // Handle item level filter
    if (sections['Item Level'] && sections['Item Level'][0]) {
        const itemLevel = parseInt(sections['Item Level'][0].split(': ')[1]);
        if (!isNaN(itemLevel)) {
            filters.ilvl = {
                min: itemLevel,
                max: itemLevel
            };
        }
    }

    // Handle quality filter
    const qualityFilter = availableFilters.find(f => f.id === 'quality');
    if (qualityFilter && properties.quality) {
        filters.quality = {
            min: properties.quality,
            max: properties.quality
        };
    }

    return { filters };
}

function parseItem(itemText) {
    const lines = itemText.split('\n');
    const sections = {};
    let currentSection = 'header';
    
    // Parse the item text into sections
    lines.forEach(line => {
        if (line === '--------') {
            currentSection = '';
            return;
        }
        
        // Special handling for Item Level
        if (line.startsWith('Item Level:')) {
            if (!sections['Item Level']) {
                sections['Item Level'] = [];
            }
            sections['Item Level'].push(line);
            return;
        }
        
        if (!sections[currentSection]) {
            sections[currentSection] = [];
        }
        sections[currentSection].push(line);
    });
    
    // Extract basic item information
    const itemClass = sections.header[0].split(': ')[1];
    const rarityText = sections.header[1].split(': ')[1];
    const rarity = getRarityFromText(rarityText) || rarityText.toLowerCase();
    const name = sections.header[2];
    const baseType = sections.header[3];
    
    // Parse requirements
    const requirements = {};
    if (sections['Requirements']) {
        sections['Requirements'].forEach(req => {
            const [key, value] = req.split(': ');
            requirements[key.toLowerCase()] = parseInt(value) || value;
        });
    }

    // Parse item properties
    const properties = {};
    if (sections['']) {
        sections[''].forEach(prop => {
            if (prop.includes(':')) {
                const [key, value] = prop.split(': ');
                if (key === 'Physical Damage') {
                    const [min, max] = value.split('-').map(v => parseInt(v));
                    properties.physical_damage = { min, max };
                    properties.pdps = { min: min, max: max };
                } else if (key === 'Critical Hit Chance') {
                    const critValue = parseFloat(value);
                    properties.crit = { min: critValue, max: critValue };
                } else if (key === 'Attacks per Second') {
                    const apsValue = parseFloat(value);
                    properties.aps = { min: apsValue, max: apsValue };
                } else if (key === 'Energy Shield') {
                    const esValue = parseInt(value);
                    properties.es = { min: esValue, max: esValue };
                } else if (key === 'Armour') {
                    const arValue = parseInt(value);
                    properties.ar = { min: arValue, max: arValue };
                } else if (key === 'Evasion') {
                    const evValue = parseInt(value);
                    properties.ev = { min: evValue, max: evValue };
                }
            }
        });
    }

    // Parse item stats
    const stats = {
        type: "and",
        filters: []
    };
    const statSections = sections[''].filter(line => !line.includes(':') && !line.includes('(rune)'));
    
    statSections.forEach(stat => {
        const normalizedStat = normalizeStatText(stat);
        const statId = findStatId(normalizedStat);
        const value = parseStatValue(stat);
        if (statId && value !== null) {
            stats.filters.push({
                id: statId,
                value: {
                    min: value,
                    max: value
                }
            });
        }
    });
    
    // Get the category based on item class
    const category = getCategoryFromItemClass(itemClass);
    
    // Create the API payload
    const payload = {
        query: {
            status: {
                option: "online"
            },
            stats: [
                stats
            ],
            filters: {
                type_filters: buildTypeFilters(itemClass, rarityText, sections, properties),
                equipment_filters: buildEquipmentFilters(properties),
                req_filters: {
                    filters: Object.fromEntries(
                        Object.entries({
                            lvl: requirements.level && { min: requirements.level, max: requirements.level },
                            str: requirements.str && { min: requirements.str, max: requirements.str },
                            dex: requirements.dex && { min: requirements.dex, max: requirements.dex },
                            int: requirements.int && { min: requirements.int, max: requirements.int }
                        }).filter(([_, value]) => value !== undefined)
                    )
                },
                misc_filters: {
                    filters: {
                        ...(sections.Corrupted && { corrupted: { option: "true" } }),
                        identified: { option: "true" }
                    }
                }
            }
        },
        sort: {
            price: "asc"
        }
    };

    return payload;
}

export { parseItem };

// Test the parser
const payload = parseItem(input);
// const payload2 = parseItem(input2);
console.log(JSON.stringify(payload, null, 2));
// console.log(JSON.stringify(payload2, null, 2));