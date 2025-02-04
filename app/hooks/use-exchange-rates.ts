import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ExchangeRateResponse } from '~/lib/types';

export function useExchangeRates() {
    return useQuery({
        queryKey: ['exchange-rates'],
        queryFn: async () => {
            const { data } = await axios.get<ExchangeRateResponse>('/api/v2/exchange-data');
            
            // Convert string rates to numbers for easier use
            const numericRates: { [key: string]: number } = {};
            for (const [currency, rate] of Object.entries(data.rates)) {
                numericRates[currency] = parseFloat(rate);
            }

            return {
                ...data,
                rates: numericRates
            };
        },
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
        staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

export const convertCurrency = (
    amount: number, 
    from: string, 
    to: string, 
    rates: { [key: string]: number }
): number | null => {
    if (from === to) return amount;
    
    // Try direct conversion
    const directRate = rates[`${from}_${to}`];
    if (directRate) return amount * directRate;
    
    // Try inverse conversion
    const inverseRate = rates[`${to}_${from}`];
    if (inverseRate) return amount / inverseRate;
    
    // Try conversion through chaos orbs
    const fromToChaos = rates[`${from}_chaos`];
    const chaosToTarget = rates[`chaos_${to}`];
    if (fromToChaos && chaosToTarget) {
        return amount * fromToChaos * chaosToTarget;
    }

    // Try conversion through exalted orbs
    const fromToExalt = rates[`${from}_exalted`];
    const exaltToTarget = rates[`exalted_${to}`];
    if (fromToExalt && exaltToTarget) {
        return amount * fromToExalt * exaltToTarget;
    }
    
    return null;
};
