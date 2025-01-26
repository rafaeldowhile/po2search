import readline from 'readline';
import { parseItem } from './poe2search.js';
import POE2TradeAPI from './poe2api.js';

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to get multiline input from user
async function getItemDescription() {
    return new Promise((resolve) => {
        console.log('Please paste your item description below.');
        console.log('Press Enter and then Ctrl+D (Unix) or Ctrl+Z (Windows) to finish:');
        
        let description = '';
        let lastLineEmpty = false;
        
        rl.on('line', (line) => {
            if (line.trim() === '') {
                if (lastLineEmpty && description.trim()) {
                    rl.close();
                    return;
                }
                lastLineEmpty = true;
            } else {
                lastLineEmpty = false;
            }
            description += line + '\n';
        });

        rl.on('close', () => {
            resolve(description.trim());
        });
    });
}

// Main function to handle the search process
async function main() {
    try {
        // Get the session ID from environment variable
        const sessionId = process.env.POE_SESSION_ID;
        if (!sessionId) {
            console.error('Error: POE_SESSION_ID environment variable is not set');
            console.log('Please set your POE session ID first:');
            console.log('export POE_SESSION_ID=your_session_id');
            process.exit(1);
        }

        // Initialize the API client
        const api = new POE2TradeAPI(sessionId);

        while (true) {
            console.log('\n=== POE2 Item Search ===');
            console.log('(Type "exit" and press Enter to quit)\n');

            // Get item description from user
            const itemDescription = await getItemDescription();
            
            // Check if user wants to exit
            if (itemDescription.toLowerCase().trim() === 'exit') {
                console.log('Goodbye!');
                break;
            }

            try {
                // Parse the item description
                const payload = parseItem(itemDescription);
                console.log('\nSearch Payload:\n', JSON.stringify(payload, null, 2));

                // Search for similar items
                const searchResult = await api.search(payload);
                console.log('\nSearch Response:\n', JSON.stringify(searchResult, null, 2));
            } catch (error) {
                console.error('Error processing item:', error.message);
            }
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
    } finally {
        rl.close();
        process.exit(0);
    }
}

main();