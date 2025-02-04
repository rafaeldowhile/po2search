import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import type { Agent } from 'http';
import tunnel from 'tunnel';
import { Poe2QueryResponse, QueryRealm } from './types';

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
    private readonly MAX_RETRIES = 3;

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

    private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: Error | null = null;
        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                return await operation();
            } catch (error: any) {
                lastError = error;
                if (error instanceof AxiosError) {
                    const status = error.response?.status;
                    if (status && status >= 400) {
                        if (attempt < this.MAX_RETRIES) {
                            console.log(`Attempt ${attempt} failed with status ${status}. Retrying immediately...`);
                            continue;
                        }
                    }
                }
                throw error;
            }
        }
        throw lastError;
    }

    async makeRequest<T>(method: string, url: string, config: AxiosRequestConfig = {}) {
        const axiosConfig = {
            ...this.getAxiosConfig(config.headers || {}),
            ...config,
            method,
            url,
        };

        return this.retryOperation(async () => {
            const response = await axios(axiosConfig);
            if (!response.data) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        });
    }

    async search(payload: any, league = 'Standard'): Promise<Poe2QueryResponse> {
        const url = `${this.baseUrl}/search/poe2/${league}`;
        const response = await this.makeRequest('POST', url, {
            headers: {
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
            },
            data: payload
        });
        return response.data;
    }

    async fetch(itemIds: string[], queryId: string, realm: QueryRealm = QueryRealm.poe2) {
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
            const url = `${this.baseUrl}/fetch/${batch.join(',')}?query=${queryId}&realm=${realm}`;

            const headers = {
                'accept': '*/*',
                'accept-language': 'en-US,en;q=0.9',
                'origin': 'https://www.pathofexile.com',
                'priority': 'u=1, i',
                'referer': `https://www.pathofexile.com/trade2/search/poe2/Standard/${queryId}`,
                'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'x-requested-with': 'XMLHttpRequest'
            };

            return this.retryOperation(async () => {
                const response = await axios.get(url, this.getAxiosConfig(headers));

                if (!response.data) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return response.data;
            });
        });

        // Execute all requests in parallel
        const results = await Promise.all(fetchPromises);

        const combinedResult = {
            result: results.flatMap(batch => batch.result || [])
        };

        return combinedResult;
    }
}

export default POE2TradeAPI;