import fetch from 'node-fetch';

class POE2TradeAPI {
    constructor(sessionId) {
        this.baseUrl = 'https://www.pathofexile.com/api/trade2';
        this.sessionId = sessionId;
    }

    async search(payload, league = 'Standard') {
        const url = `${this.baseUrl}/search/poe2/${league}`;

        const headers = {
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'application/json',
            'origin': 'https://www.pathofexile.com',
            'priority': 'u=1, i',
            'referer': 'https://www.pathofexile.com/trade2/search/poe2/Standard',
            'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest'
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP error! status: ${response.status}\nResponse: ${errorData}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error making trade search request:', error);
            throw error;
        }
    }

    async fetch(itemIds, query, realm = 'poe2') {
        if (!Array.isArray(itemIds) || itemIds.length === 0) {
            throw new Error('Item IDs must be a non-empty array');
        }

        // Process items in batches of 10
        const batchSize = 10;
        const batches = [];
        for (let i = 0; i < itemIds.length; i += batchSize) {
            const batch = itemIds.slice(i, i + batchSize);
            const url = `${this.baseUrl}/fetch/${batch.join(',')}?query=${query}&realm=${realm}`;

            const headers = {
                'accept': '*/*',
                'accept-language': 'en-US,en;q=0.9',
                'origin': 'https://www.pathofexile.com',
                'priority': 'u=1, i',
                'referer': `https://www.pathofexile.com/trade2/search/poe2/Standard/${query}`,
                'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'x-requested-with': 'XMLHttpRequest'
            };

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: headers
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                batches.push(data);

                // Add a small delay between batches to avoid rate limiting
                if (i + batchSize < itemIds.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } catch (error) {
                console.error('Error fetching item details:', error);
                throw error;
            }
        }

        // Combine all batches into a single result
        const combinedResult = {
            result: batches.flatMap(batch => batch.result || [])
        };

        return {
            headers: {},  // Headers from the last request
            status: 200,
            data: combinedResult
        };
    }
}

export default POE2TradeAPI;