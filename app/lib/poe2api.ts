import axios from 'axios';
import type { Agent } from 'http';
import tunnel from 'tunnel';

interface ProxyConfig {
    host: string;
    port: number;
    auth: {
        username: string;
        password: string;
    };
}

class POE2TradeAPI {
    private baseUrl: string;
    private proxyConfig: ProxyConfig | null = null;
    private agent: Agent | null = null;

    constructor() {
        this.baseUrl = 'https://www.pathofexile.com/api/trade2';

        if (!!process.env.USE_PROXY) {
            this.proxyConfig = {
                host: process.env.PROXY_HOST || 'gw.dataimpulse.com',
                port: Number(process.env.PROXY_PORT) || 823,
                auth: {
                    username: process.env.PROXY_USERNAME || '',
                    password: process.env.PROXY_PASSWORD || ''
                }
            };

            this.agent = tunnel.httpsOverHttp({
                proxy: {
                    host: this.proxyConfig.host,
                    port: this.proxyConfig.port,
                    proxyAuth: `${this.proxyConfig.auth.username}:${this.proxyConfig.auth.password}`
                }
            });
        } else {
            this.agent = null;
        }
    }

    private getAxiosConfig(headers: Record<string, string>) {
        const config: any = {
            headers,
            maxRedirects: 5,
            timeout: 30000,
            validateStatus: (status: number) => {
                return status >= 200 && status < 500;
            }
        };

        // Only add proxy configuration if agent exists
        if (this.agent) {
            config.httpsAgent = this.agent;
            config.proxy = false;
        }

        return config;
    }

    // Test proxy connection
    async testProxy() {
        try {
            const response = await axios.get('https://api.ipify.org/', this.getAxiosConfig({}));
            console.log('Proxy IP:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Proxy test failed:', {
                message: error.message,
                code: error.code,
                response: error.response?.data,
                stack: error.stack
            });
            throw error;
        }
    }

    async search(payload: any, league = 'Standard') {
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
            const response = await axios.post(url, payload, this.getAxiosConfig(headers));

            if (!response.data) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (response.status === 403) {
                throw new Error('Forbidden - Access denied');
            }

            return response.data;
        } catch (error: any) {
            console.error('Error making trade search request:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers
            });
            throw error;
        }
    }

    async fetch(itemIds: string[], query: string, realm = 'poe2') {
        if (!Array.isArray(itemIds) || itemIds.length === 0) {
            throw new Error('Item IDs must be a non-empty array');
        }

        const batchSize = 10; // API limit of 10 items per request
        const batches = [];
        
        // Split itemIds into batches of 10
        for (let i = 0; i < itemIds.length; i += batchSize) {
            batches.push(itemIds.slice(i, i + batchSize));
        }

        // Create fetch promises for all batches
        const fetchPromises = batches.map(async (batch) => {
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
                const response = await axios.get(url, this.getAxiosConfig(headers));

                if (!response.data) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return response.data;
            } catch (error) {
                console.error('Error fetching item details:', error);
                throw error;
            }
        });

        // Execute all requests in parallel
        const results = await Promise.all(fetchPromises);

        const combinedResult = {
            result: results.flatMap(batch => batch.result || [])
        };

        return {
            headers: {},
            status: 200,
            data: combinedResult
        };
    }
}

export default POE2TradeAPI;