import { LoaderFunctionArgs } from "@remix-run/node";
import POE2TradeAPI from "~/lib/poe2api";

interface OrbwatchItem {
    type: string;
    id: string;
    name: string;
    icon: string;
    price: string;
    listings_count: number;
    confidence: 'high' | 'medium' | 'low';
}

interface OrbwatchResponse {
    success: boolean;
    items: OrbwatchItem[];
}

// Cache management
let cachedRates: { [key: string]: number } | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchExchangeRates() {
    const now = Date.now();
    
    if (cachedRates && (now - lastFetchTime < CACHE_DURATION)) {
        return cachedRates;
    }

    try {
        const api = new POE2TradeAPI();
        const response = await api.makeRequest<OrbwatchResponse>(
            'GET',
            'https://orbwatch.trade/api/search/all?realm=Standard',
            {
                headers: {
                    'accept': '*/*',
                    'accept-language': 'en-US,en;q=0.9',
                    'priority': 'u=1, i',
                    'referer': 'https://orbwatch.trade/',
                    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
                }
            }
        );

        if (!response.data.success) {
            throw new Error('Failed to fetch exchange rates');
        }

        // Just store the raw chaos prices
        const rates: { [key: string]: number } = {};
        for (const item of response.data.items) {
            if (item.type === 'currency') {
                rates[item.id] = item.price;
            }
        }

        // Update cache
        cachedRates = rates;
        lastFetchTime = now;

        return rates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return {};
    }
}

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const rates = await fetchExchangeRates();
        
        return Response.json({
            success: true,
            timestamp: Date.now(),
            rates
        });
    } catch (error) {
        console.error('Exchange rate error:', error);
        return Response.json({
            success: false,
            error: 'Failed to fetch exchange rates'
        }, { status: 500 });
    }
}
