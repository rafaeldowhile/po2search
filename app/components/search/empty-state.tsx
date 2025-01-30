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

        const enabledStatsCount = currentStats.filters.filter(f => !f.disabled).length;
        const newMinCount = Math.max(1, enabledStatsCount - 1);

        return { newMinCount, enabledStatsCount };
    };

    const countSuggestion = handleSwitchToCount();
    const isCountMode = parsedQuery?.query?.stats?.[0]?.type === 'count';

    const handleCountModeSwitch = () => {
        const currentStats = parsedQuery?.query?.stats?.[0];
        if (!currentStats || !countSuggestion) return;

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
        onSearch();
    };

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex items-center justify-center w-16 h-16 bg-muted/30 rounded-full mb-6">
                <AlertCircle className="h-8 w-8 text-muted-foreground/70" />
            </div>

            <div className="max-w-[450px] text-center space-y-4 mb-8">
                <h3 className="text-xl font-semibold">
                    No exact matches found
                </h3>
                <div className="space-y-6">
                    {!isCountMode && countSuggestion && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                            <h4 className="font-medium text-sm text-primary">Recommended: Try Count Matching</h4>
                            <p className="text-sm text-muted-foreground">
                                Instead of requiring all {countSuggestion.enabledStatsCount} stats to match, we can search for items with at least {countSuggestion.newMinCount} matching stats.
                            </p>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleCountModeSwitch}
                                className="w-full mt-2"
                            >
                                <Calculator className="mr-2 h-4 w-4" />
                                Try with {countSuggestion.newMinCount} matching stats
                            </Button>
                        </div>
                    )}

                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Other options to find matches:</h4>
                        <ul className="text-sm text-muted-foreground space-y-3">
                            <li className="flex items-start gap-2">
                                <Filter className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>Adjust your stat ranges or disable some less important stats</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <ExternalLink className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>Continue your search on Path of Exile Trade</span>
                            </li>
                        </ul>
                    </div>
                </div>
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
        </div>
    );
} 