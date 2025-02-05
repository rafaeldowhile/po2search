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

        const minPrice = Math.floor(priceData[0].exaltedAmount);
        const maxPrice = Math.ceil(priceData[priceData.length - 1].exaltedAmount);

        // Increase granularity by using a smaller divisor
        const targetRanges = Math.min(50, Math.max(20, Math.floor(priceData.length / 2)));
        const rangeSize = (maxPrice - minPrice) / targetRanges;

        // Ensure minimum range size doesn't group too many items together
        const finalRangeSize = Math.max(0.05, rangeSize);

        const ranges: { [key: string]: number } = {};

        priceData.forEach(({ exaltedAmount }) => {
            const rangeStart = Math.floor(exaltedAmount / finalRangeSize) * finalRangeSize;
            const rangeKey = `${rangeStart.toFixed(2)}-${(rangeStart + finalRangeSize).toFixed(2)}`;
            ranges[rangeKey] = (ranges[rangeKey] || 0) + 1;
        });

        return Object.entries(ranges)
            .map(([range, count]) => ({
                range: `${range} ex`,
                count
            }))
            .sort((a, b) => {
                // Sort by the start of the range
                const aStart = parseFloat(a.range.split('-')[0]);
                const bStart = parseFloat(b.range.split('-')[0]);
                return aStart - bStart;
            });
    }, [priceData]);

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
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
