import axios from "axios";
import { AlertCircle, Calculator, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { POE2Query } from "~/lib/poe2-query-schema";
import { QueryOptions, SearchResponse } from "~/lib/types";
import { Button } from "../ui/button";

const POE2_TRADE_URL = 'https://www.pathofexile.com/trade2/search/poe2'

interface NoResultsFoundProps {
    searchId?: string;
    query: POE2Query;
    options: QueryOptions;
    onUpdateQuery?: (newQuery: POE2Query, response: SearchResponse) => void;
}

export const NoResultsFound = ({ query, options, searchId, onUpdateQuery }: NoResultsFoundProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isCountMode = query.query.stats?.[0]?.type === 'count';
    const enabledStats = query.query.stats?.[0]?.filters?.filter(f => !f.disabled) ?? [];

    // Updated count calculation to match QueryEditor logic
    const currentMinCount = isCountMode
        ? query.query.stats?.[0]?.value?.min ?? enabledStats.length
        : enabledStats.length;

    const countSuggestion = enabledStats.length > 1 ? {
        enabledStatsCount: enabledStats.length,
        currentMinCount,
        // Updated suggestion logic to be more consistent
        newMinCount: isCountMode
            ? (currentMinCount > 1 ? currentMinCount - 1 : 1)
            : Math.max(1, enabledStats.length - 1)
    } : null;

    const handleCountModeSwitch = async () => {
        if (!onUpdateQuery || !countSuggestion) return;

        try {
            setIsSubmitting(true);
            const newQuery = structuredClone(query); // Deep clone to ensure clean update

            if (newQuery.query.stats?.[0]) {
                newQuery.query.stats[0] = {
                    ...newQuery.query.stats[0],
                    type: 'count',
                    value: {
                        min: countSuggestion.newMinCount
                    }
                };

                const response = await axios.post('/api/v2/search/update', {
                    query: newQuery,
                    options: options
                });

                // This will update both the results and the form
                onUpdateQuery(newQuery, response.data);
            }
        } catch (e: any) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
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
                    {countSuggestion && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                            <h4 className="font-medium text-sm text-primary">
                                {isCountMode ? 'Recommended: Reduce Required Stats' : 'Recommended: Try Count Matching'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                {isCountMode
                                    ? `Currently requiring ${countSuggestion.currentMinCount} matching stats. We can reduce this to ${countSuggestion.newMinCount} to see more results.`
                                    : `Instead of requiring all ${countSuggestion.enabledStatsCount} stats to match, we can search for items with at least ${countSuggestion.newMinCount} matching stats.`
                                }
                            </p>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleCountModeSwitch}
                                className="w-full mt-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                )}
                                <Calculator className="mr-2 h-4 w-4" />
                                {isCountMode
                                    ? `Reduce to ${countSuggestion.newMinCount} matching stats`
                                    : `Try with ${countSuggestion.newMinCount} matching stats`
                                }
                            </Button>
                        </div>
                    )}

                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Other options to find matches:</h4>
                        <ul className="text-sm text-muted-foreground space-y-3">
                            <li className="flex justify-center gap-2">
                                <ExternalLink className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>Continue your search on Path of Exile Trade</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                {searchId && (
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`${POE2_TRADE_URL}/${options.league}/${searchId}`, '_blank')}
                    >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in PoE Trade
                    </Button>
                )}
            </div>
        </div>
    )
}