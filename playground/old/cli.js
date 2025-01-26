#!/usr/bin/env node

import { Command } from 'commander';
import { parseItem } from './poe2search.js';
import POE2TradeAPI from '../poe2api.js';
import readline from 'readline';
import { formatTradeResults } from '../display.js';

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

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
      });

      let itemText = '';
      let lastLineWasSeparator = false;

      return new Promise((resolve) => {
        rl.on('line', (line) => {
          if (line.trim() === 'Corrupted' ||
            (lastLineWasSeparator && line.trim() !== '--------' && line.trim() !== '')) {
            itemText += line;
            rl.close();
            resolve(itemText.trim());
          } else {
            lastLineWasSeparator = line.trim() === '--------';
            itemText += line + '\n';
          }
        });

        rl.on('close', () => {
          resolve(itemText.trim());
        });
      });
    };

    const processSearch = async (text) => {
      try {
        const searchPayload = parseItem(text);
        console.log('\nSearch Payload:\n', JSON.stringify(searchPayload, null, 2));

        const searchResult = await api.search(searchPayload);
        console.log('\nSearch Response:\n', JSON.stringify(searchResult, null, 2));

        // If we have search results, fetch the item details
        if (searchResult.data && searchResult.data.result && searchResult.data.result.length > 0) {
          console.log('\nFetching item details...');
          const itemIds = searchResult.data.result; // Get all results
          const fetchResult = await api.fetch(itemIds, searchResult.data.id);
          if (fetchResult.data && fetchResult.data.result) {
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