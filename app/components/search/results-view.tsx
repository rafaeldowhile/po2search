import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Copy, ExternalLink } from "lucide-react";
import { PoEItemCard } from "~/components/ui/poe-item-card";
import type { SearchResult } from "~/types/search";
import { POE2_TRADE_URL } from "~/constants/search";
import { LoadingState } from "~/components/ui/loading-state";
import { EmptyState } from "./empty-state";

interface ResultsViewProps {
    result?: SearchResult;
    error?: string | null;
    onCopy: () => void;
    isLoading?: boolean;
    onOpenQueryEditor: () => void;
}

export function ResultsView({
    result,
    error,
    onCopy,
    isLoading,
    onOpenQueryEditor
}: ResultsViewProps) {
    if (!result && !error && !isLoading) return null;

    const hasResults = result?.items && result.items.length > 0;
    const showEmptyState = result && !isLoading && !error && !hasResults;

    return (
        <div className="space-y-4">
            <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-semibold">Search Results</h2>
                    {result?.matches !== undefined && result.matches > 0 && (
                        <Badge variant="secondary">
                            {result.matches} {result.matches === 1 ? 'match' : 'matches'} found
                        </Badge>
                    )}
                    {hasResults && (
                        <Badge variant="outline">
                            Showing {result.items.length} items
                        </Badge>
                    )}
                    {result?.searchId && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-muted-foreground"
                            onClick={() => window.open(`${POE2_TRADE_URL}/${result.searchId}`, '_blank')}
                        >
                            Path of Exile Trade
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <LoadingState message="Searching for items..." />
            ) : error ? (
                <div className="p-4 border rounded-md bg-destructive/10 text-destructive">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            ) : showEmptyState ? (
                <EmptyState
                    searchId={result.searchId}
                    onOpenQueryEditor={onOpenQueryEditor}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {result?.items?.map((item, index) => (
                        <PoEItemCard
                            key={index}
                            item={item.item}
                            listing={item.listing}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 