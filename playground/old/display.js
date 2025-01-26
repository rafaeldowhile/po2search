import { parseItem } from './poe2search.js';
import fs from 'fs';
import path from 'path';

// Load currency data
const exchangeData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'exchangeData.json'), 'utf8'));
const currencyMap = new Map(exchangeData.entries.map(entry => [entry.id, entry.text]));

function formatTradeResults(results) {
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

// Example usage
const sampleResult = {
    "id": "d3a988816761077bb510d7dc0c36655aad004c761b9bbefaf8d8038cff0c8c49",
    "listing": {
        "method": "psapi",
        "indexed": "2025-01-25T17:05:05Z",
        "stash": {
            "name": "Vente",
            "x": 3,
            "y": 7
        },
        "account": {
            "name": "stefbosso#9927",
            "online": {
                "league": "Standard"
            },
            "lastCharacterName": "Lhanne",
            "language": "fr_FR",
            "realm": "poe2"
        },
        "price": {
            "type": "~price",
            "amount": 1,
            "currency": "aug"
        }
    },
    "item": {
        "name": "Loath Knell",
        "typeLine": "Leaden Greathammer",
        "ilvl": 43,
        "corrupted": true,
        "league": "Standard",
        "extended": {
            "dps": 74.8,
            "pdps": 74.8,
            "edps": 0
        }
    }
};

formatTradeResults([sampleResult]);

export { formatTradeResults };