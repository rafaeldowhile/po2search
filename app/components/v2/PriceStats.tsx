interface PriceStatsProps {
    stats: {
        lowest: number;
        highest: number;
        mean: number;
        median: number;
        mode?: Record<number, number>;
    };
}

export const PriceStats = ({ stats }: PriceStatsProps) => {
    const formatPrice = (value: number | Record<number, number>) => {
        if (typeof value !== 'number') {
            // For mode, find the most frequent value
            const entries = Object.entries(value);
            if (!entries.length) return '0.00';
            const mostFrequent = entries.reduce((a, b) => 
                (value[Number(a[0])] > value[Number(b[0])] ? a : b)
            );
            return Number(mostFrequent[0]).toFixed(2);
        }
        return value.toFixed(2);
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="flex flex-col p-3 bg-secondary/50 rounded-lg">
                    <span className="text-sm text-muted-foreground capitalize">{key}</span>
                    <span className="text-lg font-medium">{formatPrice(value)} exalted orbs</span>
                </div>
            ))}
        </div>
    );
};
