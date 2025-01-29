import { Button } from "~/components/ui/button";
import { ExternalLink, Filter, AlertCircle, Calculator } from "lucide-react";
import { POE2_TRADE_URL } from "~/constants/search";
import type { ParsedQuery } from "~/types/search";

interface EmptyStateProps {
    searchId?: string;
    onOpenQueryEditor: () => void;
    parsedQuery: ParsedQuery;
    onQueryChange: (newQuery: ParsedQuery) => void;
    onSearch: () => void;
}

export function EmptyState({ searchId, onOpenQueryEditor, parsedQuery, onQueryChange, onSearch }: EmptyStateProps) {
    const handleSwitchToCount = () => {
        const currentStats = parsedQuery?.query?.stats?.[0];
        if (!currentStats) return;

        // Count all enabled stats, including runes and enchants
        const enabledStatsCount = currentStats.filters.filter(f => !f.disabled).length;
        const newMinCount = Math.max(1, enabledStatsCount - 1);

        // Show how many stats will be required
        const message = `Try matching ${newMinCount} out of ${enabledStatsCount} stats`;

        return { newMinCount, message };
    };

    const countSuggestion = handleSwitchToCount();
    const isCountMode = parsedQuery?.query?.stats?.[0]?.type === 'count';

    const handleCountModeSwitch = () => {
        const currentStats = parsedQuery?.query?.stats?.[0];
        if (!currentStats || !countSuggestion) return;

        // If already in count mode, reduce the count by 1
        if (isCountMode) {
            const currentMin = currentStats.value?.min || 0;
            const enabledStatsCount = currentStats.filters.filter(f => !f.disabled).length;
            const newMinCount = Math.max(1, currentMin - 1);

            onQueryChange({
                ...parsedQuery,
                query: {
                    ...parsedQuery.query,
                    stats: [{
                        ...currentStats,
                        value: { min: newMinCount }
                    }]
                }
            });
        } else {
            // Switch to count mode
            onQueryChange({
                ...parsedQuery,
                query: {
                    ...parsedQuery.query,
                    stats: [{
                        ...currentStats,
                        type: 'count',
                        value: { min: countSuggestion.newMinCount }
                    }]
                }
            });
        }

        // Immediately trigger the search
        onSearch();
    };

    const getButtonText = () => {
        const currentStats = parsedQuery?.query?.stats?.[0];
        if (!currentStats) return '';

        const enabledStatsCount = currentStats.filters.filter(f => !f.disabled).length;
        
        if (isCountMode) {
            const currentMin = currentStats.value?.min || 0;
            if (currentMin <= 1) return `Currently matching ${currentMin} out of ${enabledStatsCount} stats`;
            return `Try matching ${currentMin - 1} out of ${enabledStatsCount} stats`;
        }
        
        return countSuggestion?.message || `Try matching ${enabledStatsCount - 1} out of ${enabledStatsCount} stats`;
    };

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex items-center justify-center w-16 h-16 bg-muted/30 rounded-full mb-6">
                <AlertCircle className="h-8 w-8 text-muted-foreground/70" />
            </div>

            <div className="max-w-[450px] text-center space-y-3 mb-8">
                <h3 className="text-xl font-semibold">
                    No items found
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    We couldn't find any items matching your search criteria. You can try:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 mt-2">
                    <li className="flex items-center gap-2 justify-center">
                        <Filter className="h-4 w-4" />
                        Adjusting your filters to broaden your search
                    </li>
                    <li className="flex items-center gap-2 justify-center">
                        <ExternalLink className="h-4 w-4" />
                        Continuing your search on Path of Exile Trade
                    </li>
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <Button
                    variant="default"
                    className="flex-1"
                    onClick={onOpenQueryEditor}
                >
                    <Filter className="mr-2 h-4 w-4" />
                    Adjust Filters
                </Button>
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handleCountModeSwitch}
                    disabled={parsedQuery?.query?.stats?.[0]?.value?.min === 1}
                >
                    <Calculator className="mr-2 h-4 w-4" />
                    {getButtonText()}
                </Button>
                {searchId && (
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`${POE2_TRADE_URL}/${searchId}`, '_blank')}
                    >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in PoE Trade
                    </Button>
                )}
            </div>

            {/* Quick Tips */}
            <div className="mt-8 w-full max-w-md">
                <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">Quick Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                        <li>• Try removing some stat filters</li>
                        <li>• Reduce the Match Count</li>
                        <li>• Increase the min-max ranges</li>
                        <li>• Check if required stats are enabled</li>
                        <li>• Consider alternative item types</li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 