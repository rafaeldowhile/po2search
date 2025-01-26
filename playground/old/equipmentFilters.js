import fs from 'fs';
const equipmentFilters = JSON.parse(fs.readFileSync('equipmentFilters.json', 'utf8'));

function buildEquipmentFilters(properties) {
    // Get all available filters from equipmentFilters schema
    const availableFilters = equipmentFilters.filters;
    const filters = {};

    // Map properties to filters
    const propertyMap = {
        physical_damage: 'damage',
        aps: 'aps',
        crit: 'crit',
        dps: 'dps',
        pdps: 'pdps',
        edps: 'edps',
        ar: 'ar',
        ev: 'ev',
        es: 'es',
        block: 'block',
        spirit: 'spirit',
        rune_sockets: 'rune_sockets'
    };

    // Apply each filter if the property exists
    for (const [propKey, filterId] of Object.entries(propertyMap)) {
        if (properties[propKey]) {
            const filter = availableFilters.find(f => f.id === filterId);
            if (filter) {
                filters[filterId] = {
                    min: properties[propKey].min,
                    max: properties[propKey].max
                };
            }
        }
    }

    return { filters };
}

export { buildEquipmentFilters };