function parseItemHeader(headerText) {
    const lines = headerText.split('\n');
    const itemClassLine = lines.find(line => line.startsWith('Item Class:'));
    const rarityLine = lines.find(line => line.startsWith('Rarity:'));

    if (!itemClassLine || !rarityLine) {
        throw new Error('Invalid item header format');
    }

    const itemClass = itemClassLine.split(': ')[1].trim();
    const rarity = rarityLine.split(': ')[1].trim().toLowerCase();

    // Load type filters data
    const typeFilters = require('./typeFilters.json');

    // Find the matching category based on item class
    const categoryOption = findCategoryByItemClass(itemClass, typeFilters);

    return {
        type_filters: {
            filters: {
                category: categoryOption ? { option: categoryOption } : { option: null },
                rarity: { option: rarity }
            }
        }
    };
}

function findCategoryByItemClass(itemClass, typeFilters) {
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

module.exports = {
    parseItemHeader
};