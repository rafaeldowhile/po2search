#!/usr/bin/env node

import { Command } from 'commander';
import { search } from './search.js';
import POE2TradeAPI from '../old/poe2api.js';
import { formatTradeResults } from './display.js';
import { exec } from 'child_process';

const program = new Command();

// Setup CLI program
program
    .name('poe2search')
    .description('Search for Path of Exile 2 items using item text')
    .version('1.0.0');

program
    .command('search')
    .description('Search for items by pasting item text')
    .argument('[itemText]', 'Item text to search for')
    .option('-c, --continuous', 'Enable continuous search mode')
    .action(async (itemText, options) => {
        // Initialize the API client
        const api = new POE2TradeAPI('');

        const searchItem = async () => {
            console.log('\nPaste your item text below:\n');

            return new Promise(resolve => {
                let data = '';
                let inputTimeout;
                const TIMEOUT_MS = 100;

                process.stdin.setRawMode(true);
                process.stdin.resume();
                process.stdin.setEncoding('utf8');

                process.stdin.on('data', chunk => {
                    // Handle Ctrl+C
                    if (chunk === '\u0003') {
                        process.exit(0);
                    }

                    // Replace \r with \n and normalize multiple newlines
                    const normalizedChunk = chunk
                        .replace(/\r\n/g, '\n')
                        .replace(/\r/g, '\n')
                        .replace(/\n+/g, '\n');

                    data += normalizedChunk;

                    // Clear existing timeout
                    if (inputTimeout) {
                        clearTimeout(inputTimeout);
                    }

                    // Set new timeout
                    inputTimeout = setTimeout(() => {
                        process.stdin.setRawMode(false);
                        process.stdin.pause();
                        // Clean up the final string
                        const cleanedData = data
                            .trim()
                            .split('\n')
                            .map(line => line.trim())
                            .join('\n');
                        resolve(cleanedData);
                    }, TIMEOUT_MS);
                });
            });
        };

        const processSearch = async (text) => {
            try {
                const searchPayload = search(text);
                console.log('\nSearch Payload:', JSON.stringify(searchPayload, null, 2));

                const searchResult = await api.search(searchPayload);
                console.log('\nSearch Response ID:', searchResult.id);

                // Open trade website in browser
                const tradeUrl = `https://www.pathofexile.com/trade2/search/poe2/Standard/${searchResult.id}`;
                const command = process.platform === 'win32' ? 'start' :
                    process.platform === 'darwin' ? 'open' : 'xdg-open';

                exec(`${command} ${tradeUrl}`);
                console.log(`\nOpened in browser: ${tradeUrl}`);

                // If we have search results, fetch the item details
                if (searchResult?.result?.length > 0) {
                    const totalResults = searchResult.result.length;
                    // Take only first 10 items
                    const itemIds = searchResult.result.slice(0, 10);

                    console.log(`\nFound ${totalResults} items, fetching first 10...`);
                    const fetchResult = await api.fetch(itemIds, searchResult.id);
                    if (fetchResult.data?.result) {
                        console.log('\nSearch Results:');
                        formatTradeResults(fetchResult.data.result);
                    } else {
                        console.log('\nNo item details available.');
                    }
                } else {
                    console.log('\nNo items found matching your search criteria.');
                }
            } catch (error) {
                console.error('Error processing item:', error.message);
                if (error.cause) {
                    console.error('Cause:', error.cause);
                }
            }
        };

        do {
            const text = itemText || await searchItem();
            if (!text) {
                console.log('No item text provided. Exiting...');
                break;
            }

            await processSearch(text);

            if (!options.continuous || itemText) break;

            console.log('\n-------------------------------------------');
        } while (true);

        process.exit(0);
    });

program.parse(); 