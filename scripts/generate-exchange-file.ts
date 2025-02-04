import fs from 'fs';
import path from 'path';
import axios from 'axios';

interface CurrencyRatio {
    id: string;
    name: string;
    icon: string;
    chaosEquivalent: number;
}

interface ExchangeRates {
    rates: CurrencyRatio[];
    timestamp: number;
}

async function fetchExchangeRates(): Promise<ExchangeRates> {
    try {
        const response = await axios.get('https://poe.ninja/api/data/currencyoverview?league=Standard&type=Currency');
        
        const rates: CurrencyRatio[] = response.data.lines.map((line: any) => ({
            id: line.currencyTypeName.toLowerCase().replace(/\s+/g, '_'),
            name: line.currencyTypeName,
            icon: line.icon,
            chaosEquivalent: line.chaosEquivalent
        }));

        return {
            rates,
            timestamp: Date.now()
        };
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        throw error;
    }
}

async function generateExchangeFile() {
    try {
        const exchangeRates = await fetchExchangeRates();
        
        // Create scripts directory if it doesn't exist
        const outputDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write to file
        const outputPath = path.join(outputDir, 'exchange-rates.json');
        fs.writeFileSync(
            outputPath,
            JSON.stringify(exchangeRates, null, 2)
        );

        console.log(`Exchange rates file generated successfully at ${outputPath}`);
        console.log(`Total currencies: ${exchangeRates.rates.length}`);
        console.log(`Last updated: ${new Date(exchangeRates.timestamp).toLocaleString()}`);
    } catch (error) {
        console.error('Failed to generate exchange rates file:', error);
        process.exit(1);
    }
}

// Run the script
generateExchangeFile();
