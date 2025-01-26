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
Corrupted`

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

import fs from 'fs'
import { stringSimilarity } from 'string-similarity-js';
const flatStats = JSON.parse(fs.readFileSync('../data/flat_stats.json', 'utf8'));

const typeFilters = {
  categories: JSON.parse(fs.readFileSync('../data/type_filters/categories.json'), 'utf8'),
  rarities: JSON.parse(fs.readFileSync('../data/type_filters/rarity.json'), 'utf8'),
  requirements: JSON.parse(fs.readFileSync('../data/req_filters.json'), 'utf8')
}

const FILTER_TYPES = {
  EXACT: 'exact',    // exact match (min = max)
  RANGE: 'range',    // allows min/max
  OPTION: 'option',  // single option selection
  DISABLED: 'disabled' // filter is completely disabled
};

const RANGE_TYPES = {
  MIN_ONLY: 'min_only',     // only use minimum value
  MAX_ONLY: 'max_only',     // only use maximum value
  MIN_MAX: 'min_max',       // use both min and max
  EXACT: 'exact'            // min = max
};

const FILTER_CONFIG = {
  type_filters: {
    ilvl: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => getValueFromTextKey(lines, 'Item Level:'),
      transform: (value) => parseInt(value, 10)
    },
    quality: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: false,
      extractValue: (lines) => extractOnlyNumber(getValueFromTextKey(lines, 'Quality:')),
      transform: (value) => parseInt(value, 10)
    },
    category: {
      type: FILTER_TYPES.OPTION,
      enabled: true,
      extractValue: getCategory,
      transform: (value) => ({ option: value })
    },
    rarity: {
      type: FILTER_TYPES.OPTION,
      enabled: true,
      extractValue: getRarity,
      transform: (value) => ({ option: value })
    }
  },
  req_filters: {
    lvl: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const reqFilter = findRequirementFilter('Level');
        if (!reqFilter) return null;
        const value = getValueFromTextKey(lines, reqFilter.text + ':');
        return extractOnlyNumber(value);
      },
      transform: (value) => parseInt(value, 10)
    },
    str: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const value = getValueFromTextKey(lines, 'Str:');
        return extractOnlyNumber(value);
      },
      transform: (value) => parseInt(value, 10)
    },
    dex: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const value = getValueFromTextKey(lines, 'Dex:');
        return extractOnlyNumber(value);
      },
      transform: (value) => parseInt(value, 10)
    },
    int: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const value = getValueFromTextKey(lines, 'Int:');
        return extractOnlyNumber(value);
      },
      transform: (value) => parseInt(value, 10)
    }
  },
  equipment_filters: {
    damage: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const value = getValueFromTextKey(lines, 'Physical Damage:');
        if (!value) return null;
        const [min, max] = value.split('-').map(v => parseInt(v));
        return { min, max };
      },
      transform: (value, config) => {
        return config.range_type === RANGE_TYPES.MIN_ONLY ? value.min : value;
      }
    },
    aps: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const value = getValueFromTextKey(lines, 'Attacks per Second:');
        return value ? parseFloat(value) : null;
      },
      transform: (value) => value
    },
    crit: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const value = getValueFromTextKey(lines, 'Critical Hit Chance:');
        return value ? parseFloat(value.replace('%', '')) : null;
      },
      transform: (value) => value
    },
    pdps: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const damage = getValueFromTextKey(lines, 'Physical Damage:');
        const aps = getValueFromTextKey(lines, 'Attacks per Second:');
        if (!damage || !aps) return null;

        const [min, max] = damage.split('-').map(v => parseInt(v));
        const attacksPerSecond = parseFloat(aps);
        return ((min + max) / 2) * attacksPerSecond;
      },
      transform: (value) => value
    },
    edps: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        // Find all elemental damage lines (fire, cold, lightning)
        const elementalDamages = lines
          .filter(line => line.includes('Damage:') &&
            (line.includes('Fire') ||
              line.includes('Cold') ||
              line.includes('Lightning')))
          .map(line => {
            const damage = line.split(':')[1].trim();
            const [min, max] = damage.split('-').map(v => parseInt(v));
            return (min + max) / 2;
          });

        if (elementalDamages.length === 0) return null;

        // Just sum up the average elemental damages
        return elementalDamages.reduce((sum, dmg) => sum + dmg, 0);
      },
      transform: (value) => value
    },
    ar: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const value = getValueFromTextKey(lines, 'Armour:');
        return value ? parseInt(value) : null;
      },
      transform: (value) => value
    },
    ev: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const value = getValueFromTextKey(lines, 'Evasion:');
        return value ? parseInt(value) : null;
      },
      transform: (value) => value
    },
    es: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const value = getValueFromTextKey(lines, 'Energy Shield:');
        return value ? parseInt(value) : null;
      },
      transform: (value) => value
    },
    block: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const value = getValueFromTextKey(lines, 'Block:');
        return value ? parseInt(value.replace('%', '')) : null;
      },
      transform: (value) => value
    },
    spirit: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const value = getValueFromTextKey(lines, 'Spirit:');
        return value ? parseInt(value) : null;
      },
      transform: (value) => value
    },
    rune_sockets: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const socketLine = lines.find(line => line.includes('Sockets:'));
        if (!socketLine) return null;
        const socketPart = socketLine.split(':')[1];
        return socketPart.split(' ').filter(s => s === 'S').length;
      },
      transform: (value) => value
    },
    dps: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const value = getValueFromTextKey(lines, 'Damage per Second:');
        return value ? parseFloat(value) : null;
      },
      transform: (value) => value
    }
  },
  misc_filters: {
    gem_sockets: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: false,
      extractValue: (lines) => {
        const socketLine = lines.find(line => line.includes('Sockets:'));
        if (!socketLine) return null;
        const socketPart = socketLine.split(':')[1];
        return socketPart.split(' ').filter(s => s === 'S').length;
      },
      transform: (value) => value
    },
    area_level: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: false,
      extractValue: (lines) => {
        const value = getValueFromTextKey(lines, 'Area Level:');
        return value ? parseInt(value) : null;
      },
      transform: (value) => value
    },
    stack_size: {
      type: FILTER_TYPES.RANGE,
      range_type: RANGE_TYPES.MIN_ONLY,
      enabled: true,
      extractValue: (lines) => {
        const value = getValueFromTextKey(lines, 'Stack Size:');
        return value ? parseInt(value) : null;
      },
      transform: (value) => value
    },
    corrupted: {
      type: FILTER_TYPES.OPTION,
      enabled: true,
      extractValue: (lines) => lines.some(line => line.trim() === 'Corrupted'),
      transform: (value) => ({ option: value.toString() })
    },
    identified: {
      type: FILTER_TYPES.OPTION,
      enabled: true,
      extractValue: (lines) => {
        // Items are identified by default unless they have "Unidentified" tag
        return !lines.some(line => line === 'Unidentified');
      },
      transform: (value) => ({ option: value.toString() })
    },
    mirrored: {
      type: FILTER_TYPES.OPTION,
      enabled: true,
      extractValue: (lines) => lines.some(line => line === 'Mirrored'),
      transform: (value) => ({ option: value.toString() })
    },
    alternate_art: {
      type: FILTER_TYPES.OPTION,
      enabled: true,
      extractValue: (lines) => lines.some(line => line === 'Alternate Art'),
      transform: (value) => ({ option: value.toString() })
    }
  }
};

function parseText(input) {
  return input.split('\n').filter(line => line !== '--------');
}

function getValueFromTextKey(inputData, text) {
  const line = inputData.find(line =>
    line.toLowerCase().includes(text.toLowerCase())
  );
  if (!line) return null;
  // Still use the original text to preserve case in the replacement
  return line.substring(line.toLowerCase().indexOf(text.toLowerCase()) + text.length).trim();
}

function getCategory(inputData) {
  const value = getValueFromTextKey(inputData, 'Item Class:')
  if (!value) {
    throw new Error('No Item Class found in input');
  }

  const normalizedValue = value.toLowerCase();

  const category = typeFilters.categories.reduce((closest, current) => {
    const similarity = stringSimilarity(
      normalizedValue,
      current.text.toLowerCase()
    );

    if (!closest || similarity > closest.similarity) {
      return { category: current, similarity: similarity };
    }
    return closest;
  }, null);

  if (category && category.similarity >= 0.7) {
    return category.category.id;
  }

  throw new Error(`Could not find matching category for: ${value}`);
}

function getRarity(inputData) {
  const value = getValueFromTextKey(inputData, 'Rarity:')
  const rarityFilter = typeFilters.rarities.find(rarity => rarity.text.toLowerCase() === value.toLowerCase());
  return rarityFilter.id;
}

function extractOnlyNumber(input) {
  if (!input) return null;
  return input.replace(/\D/g, '');
}

function applyFilter(filterConfig, value) {
  if (!filterConfig.enabled || value === undefined || value === null) {
    return null;
  }

  const transformedValue = filterConfig.transform(value, filterConfig);
  if (transformedValue === null) {
    return null;
  }

  switch (filterConfig.type) {
    case FILTER_TYPES.RANGE:
      const result = {};
      switch (filterConfig.range_type) {
        case RANGE_TYPES.MIN_ONLY:
          if (transformedValue) {
            result.min = typeof transformedValue === 'object' ?
              transformedValue.min : transformedValue;
          }
          break;
        case RANGE_TYPES.MAX_ONLY:
          if (transformedValue) {
            result.max = transformedValue;
          }
          break;
        case RANGE_TYPES.MIN_MAX:
          if (transformedValue && 'min' in transformedValue && 'max' in transformedValue) {
            result.min = transformedValue.min;
            result.max = transformedValue.max;
          }
          break;
        case RANGE_TYPES.EXACT:
          if (transformedValue) {
            result.min = transformedValue;
            result.max = transformedValue;
          }
          break;
        default:
          return null;
      }
      return Object.keys(result).length > 0 ? result : null;
    case FILTER_TYPES.OPTION:
      return transformedValue;
    default:
      return null;
  }
}

function buildFilters(inputData) {
  const result = {};

  for (const [groupName, filterGroup] of Object.entries(FILTER_CONFIG)) {
    const filters = {};
    let hasFilters = false;

    for (const [filterName, filterConfig] of Object.entries(filterGroup)) {
      const value = filterConfig.extractValue(inputData);
      const filterResult = applyFilter(filterConfig, value);

      if (filterResult !== null) {
        filters[filterName] = filterResult;
        hasFilters = true;
      }
    }

    if (hasFilters) {
      result[groupName] = {
        filters,
        disabled: false
      };
    }
  }

  // Add default misc_filters if not present, or merge with existing
  if (!result.misc_filters) {
    result.misc_filters = {
      filters: {
        mirrored: { option: "false" },
        identified: { option: "true" },
        alternate_art: { option: "false" }
      },
      disabled: false
    };
  } else {
    // Ensure default values for misc filters that weren't set
    const defaultMiscFilters = {
      mirrored: { option: "false" },
      identified: { option: "true" },
      alternate_art: { option: "false" }
    };

    for (const [key, value] of Object.entries(defaultMiscFilters)) {
      if (!result.misc_filters.filters[key]) {
        result.misc_filters.filters[key] = value;
      }
    }
  }

  // Ensure equipment_filters are properly structured
  if (result.equipment_filters) {
    const equipmentFilters = result.equipment_filters.filters;
    for (const [key, value] of Object.entries(equipmentFilters)) {
      // Make sure range filters have proper min/max structure
      if (value && typeof value === 'object' && ('min' in value || 'max' in value)) {
        equipmentFilters[key] = value;
      }
    }
  }

  return result;
}

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

function extractStats(lines, rangeType = RANGE_TYPES.MIN_MAX) {
  const stats = {
    type: "and",
    filters: [],
    disabled: false
  };

  // Get all mod lines (skip header sections)
  const modLines = lines.filter(line => {
    return line.match(/^[+-]?\d+/) || // Starts with number
      line.includes('increased') ||
      line.includes('reduced') ||
      line.includes('Adds') ||
      line.includes('Gain');
  });

  for (const line of modLines) {
    const normalizedText = normalizeStatText(line);
    const statId = findStatId(normalizedText);

    if (statId) {
      // Extract the numeric value(s)
      const numbers = line.match(/[+-]?\d+(\.\d+)?/g);
      if (numbers) {
        const value = {};

        if (rangeType === RANGE_TYPES.MIN_ONLY) {
          value.min = parseFloat(numbers[0]);
        } else if (rangeType === RANGE_TYPES.MAX_ONLY) {
          value.max = parseFloat(numbers[0]);
        } else {
          // MIN_MAX or EXACT
          value.min = parseFloat(numbers[0]);
          value.max = numbers[1] ? parseFloat(numbers[1]) : parseFloat(numbers[0]);
        }

        stats.filters.push({
          id: statId,
          value
        });
      }
    }
  }

  return stats.filters.length > 0 ? stats : {};
}

function search(input, rangeType = RANGE_TYPES.MIN_ONLY) {
  const inputData = parseText(input);
  const filters = buildFilters(inputData);
  const stats = extractStats(inputData, rangeType);

  const payload = {
    query: {
      filters,
      stats: Object.keys(stats).length > 0 ? [stats] : [],
      status: {
        option: "onlineleague"
      }
    },
    sort: {
      price: 'asc'
    }
  };

  return payload;
}

console.log(JSON.stringify(search(input2), null, 2));

export { search, FILTER_CONFIG, FILTER_TYPES };

function findRequirementFilter(text) {
  return typeFilters.requirements.find(
    filter => text.toLowerCase().includes(filter.text.toLowerCase())
  );
}