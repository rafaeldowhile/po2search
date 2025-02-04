import { useMemo } from 'react';
import { PoeItemResponse } from '~/lib/types';
import { Card } from '~/components/ui/card';
import { BarChart, ScatterChart } from '@tremor/react';
import { getCurrencyData } from '~/lib/item-utils';
import { PriceStats } from './PriceStats';

interface ResultChartsProps {
    results: PoeItemResponse[];
    exchangeRates?: { [key: string]: number };
}

export const ResultCharts = ({ results = [], exchangeRates }: ResultChartsProps) => {
    const priceData = useMemo(() => {
        if (!exchangeRates || !results) return [];

        // Convert all prices to exalted orbs for consistency
        return results.map(result => {
            const amount = Number(result.listing.price.amount);
            const currency = result.listing.price.currency;
            
            let exaltedAmount = amount;
            
            // Convert to exalted if not already
            if (currency !== 'exalted' && exchangeRates[currency]) {
                exaltedAmount = amount / exchangeRates[currency];
            }
            
            return {
                originalAmount: amount,
                originalCurrency: currency,
                exaltedAmount: Number(exaltedAmount) || 0,
                time: new Date(result.listing.indexed).getTime(),
            };
        }).sort((a, b) => a.exaltedAmount - b.exaltedAmount); // Sort by price for distribution
    }, [results, exchangeRates]);

    const priceStats = useMemo(() => {
        if (!priceData.length) return null;

        const prices = priceData.map(d => d.exaltedAmount);
        const sorted = [...prices].sort((a, b) => a - b);
        
        return {
            lowest: sorted[0],
            highest: sorted[sorted.length - 1],
            mean: prices.reduce((a, b) => a + b, 0) / prices.length,
            median: sorted[Math.floor(sorted.length / 2)],
            mode: prices.reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1;
                return acc;
            }, {} as Record<number, number>),
        };
    }, [priceData]);

    const distributionData = useMemo(() => {
        if (!priceData.length) return [];

        // Create meaningful price ranges based on data
        const minPrice = Math.floor(priceData[0].exaltedAmount);
        const maxPrice = Math.ceil(priceData[priceData.length - 1].exaltedAmount);
        const rangeSize = Math.max(1, Math.ceil((maxPrice - minPrice) / 10)); // Split into ~10 ranges

        const ranges: { [key: string]: number } = {};
        
        priceData.forEach(({ exaltedAmount }) => {
            const rangeStart = Math.floor(exaltedAmount / rangeSize) * rangeSize;
            const rangeKey = `${rangeStart}-${rangeStart + rangeSize}`;
            ranges[rangeKey] = (ranges[rangeKey] || 0) + 1;
        });

        return Object.entries(ranges).map(([range, count]) => ({
            range: `${range} ex`,
            count
        }));
    }, [priceData]);

    const currencyData = useMemo(() => {
        if (!results.length) return [];

        const currencies: { [key: string]: number } = {};
        results.forEach(result => {
            const currency = result.listing.price.currency;
            currencies[currency] = (currencies[currency] || 0) + 1;
        });

        return Object.entries(currencies)
            .map(([currency, count]) => ({
                name: getCurrencyData(currency)?.text || currency,
                value: count
            }))
            .sort((a, b) => b.value - a.value);
    }, [results]);

    const bubbleData = useMemo(() => {
        if (!priceData.length) return [];

        // Group prices by their values and count occurrences
        const priceGroups = priceData.reduce((acc, { exaltedAmount }) => {
            const roundedPrice = Number(exaltedAmount.toFixed(1));
            acc[roundedPrice] = (acc[roundedPrice] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        // Convert to bubble chart format with numeric price
        return Object.entries(priceGroups).map(([price, count]) => ({
            price: Number(price), // Keep price as number
            count,
            size: count,
            label: `${price} ex` // Add label for display
        }));
    }, [priceData]);

    // Format values for charts
    const formatExaltedValue = (value: number) => `${value.toFixed(1)} ex`;
    const formatCount = (value: number) => String(value);

    if (!results?.length || !exchangeRates) {
        return (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                No data available
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {priceStats && <PriceStats stats={priceStats} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4">
                    <h3 className="font-medium mb-4">Price Distribution (in exalted)</h3>
                    <div className="text-sm text-muted-foreground mb-2">
                        Distribution of listing prices across {distributionData.length} price ranges
                    </div>
                    <div className="h-[350px] w-full">
                        <BarChart
                            data={distributionData}
                            index="range"
                            categories={["count"]}
                            colors={["blue"]}
                            valueFormatter={formatCount}
                            className="h-full"
                            showAnimation={true}
                            yAxisWidth={48}
                        />
                    </div>
                </Card>

                <Card className="p-4">
                    <h3 className="font-medium mb-4">Price Clusters</h3>
                    <div className="text-sm text-muted-foreground mb-2">
                        Bubble size represents number of listings at each price point
                    </div>
                    <div className="h-[350px] w-full">
                        <ScatterChart
                            data={bubbleData}
                            category="count"
                            x="price"
                            y="size"
                            size="size"
                            colors={["blue"]}
                            valueFormatter={{
                                x: (value: number) => `${value.toFixed(1)} ex`,
                                y: (value: number) => String(value),
                                size: (value: number) => String(value),
                            }}
                            className="h-full"
                            showAnimation={true}
                            yAxisWidth={48}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
};
