import { ExternalLink, Circle, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { LoadingState } from "~/components/ui/loading-state";
import { PoEItemCard } from "~/components/ui/poe-item-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { POE2_TRADE_URL } from "~/constants/search";
import type { ParsedQuery, SearchResult } from "~/types/search";
import { EmptyState } from "./empty-state";

interface ResultsViewProps {
    result?: SearchResult;
    error?: string | null;
    onCopy: () => void;
    isLoading?: boolean;
    onOpenQueryEditor: () => void;
    parsedQuery?: ParsedQuery;
    onSortChange?: (value: string) => void;
    onQueryChange: (newQuery: ParsedQuery) => void;
    onSearch: () => void;
}

export function ResultsView({
    result,
    error,
    onCopy,
    isLoading,
    onOpenQueryEditor,
    parsedQuery,
    onSortChange,
    onQueryChange,
    onSearch
}: ResultsViewProps) {
    if (!result && !error && !isLoading) return null;

    const hasResults = result?.items && result.items.length > 0;
    const showEmptyState = !isLoading && !error && !hasResults;

    return (
        <div className="space-y-4">
            <div className="flex flex-row items-start justify-between">
                <div className="space-y-2">
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
                    </div>

                    {hasResults && (
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                                    <span>Matched mod</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Circle className="h-3 w-3 fill-border text-border" />
                                    <span>Unmatched mod</span>
                                </div>
                            </div>

                            <div className="h-4 border-l border-border" />

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center gap-0.5 text-green-500">
                                        <ArrowUp className="h-3 w-3" />
                                        <span>+X%</span>
                                    </div>
                                    <span>Above search value</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center gap-0.5 text-red-500">
                                        <ArrowDown className="h-3 w-3" />
                                        <span>-X%</span>
                                    </div>
                                    <span>Below search value</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {hasResults && (
                        <Select
                            value={parsedQuery?.sort?.price || 'asc'}
                            onValueChange={onSortChange}
                        >
                            <SelectTrigger className="h-8">
                                <SelectValue placeholder="Sort by price" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Price: Low to High</SelectItem>
                                <SelectItem value="desc">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
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
                    searchId={result?.searchId}
                    onOpenQueryEditor={onOpenQueryEditor}
                    parsedQuery={parsedQuery}
                    onQueryChange={onQueryChange}
                    onSearch={onSearch}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {result?.items?.map((item: any) => (
                        <PoEItemCard
                            key={item.id}
                            item={item.item}
                            listing={item.listing}
                            parsedQuery={parsedQuery}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 