import fs from 'fs';

// Load currency data
const exchangeData = JSON.parse(fs.readFileSync('../data/exchangeData.json', 'utf8'));
const currencyMap = new Map(exchangeData.entries.map(entry => [entry.id, entry.text]));

export function formatTradeResults(results) {
    if (!results || !Array.isArray(results)) {
        console.error('No results to display');
        return;
    }

    const formattedResults = results.map(result => {
        const { listing, item } = result;
        return {
            'Item Name': `${item.name || ''} ${item.typeLine}`,
            'Price': `${listing.price.amount} ${currencyMap.get(listing.price.currency) || listing.price.currency}`,
            'Seller': listing.account.lastCharacterName,
            'iLvl': item.ilvl,
            'DPS': item.extended?.dps || 'N/A',
            'pDPS': item.extended?.pdps || 'N/A',
            'eDPS': item.extended?.edps || 'N/A',
            'Corrupted': item.corrupted ? 'Yes' : 'No',
            'League': item.league
        };
    });

    console.table(formattedResults);
} 