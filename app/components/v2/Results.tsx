import { useState, useMemo, useEffect } from "react";
import { QueryOptions, SearchResponse, ExchangeRateResponse } from "~/lib/types";
import { PoeItem } from "./PoeItem";
import { POE2Query } from "~/lib/poe2-query-schema";
import { ResultsFilterBar, TimeFilter, SortDirection, SortType } from "./ResultsFilterBar";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { useExchangeRates } from "~/hooks/use-exchange-rates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ResultCharts } from "./ResultCharts";

interface ResultsProps {
    searchResponse: SearchResponse;
    query: POE2Query;
    options: QueryOptions;
    onSearchUpdate: (newQuery: POE2Query, response: SearchResponse) => void;
}

export const Results = ({ searchResponse, query, options, onSearchUpdate }: ResultsProps) => {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
    const [sortType, setSortType] = useState<SortType>('none');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [preferredCurrency, setPreferredCurrency] = useLocalStorage('preferred-currency', 'exalted');
    const [isLoading, setIsLoading] = useState(false);
    const { data: exchangeData } = useExchangeRates();

    // Initialize sort from query only once on mount
    useEffect(() => {
        if (query.sort) {
            // Reset the query sort to prevent mixing server/client sorts
            const updatedQuery: POE2Query = {
                ...query,
                sort: undefined
            };
            onSearchUpdate(updatedQuery, searchResponse);
        }
    }, []); // Empty deps array to run only once

    const handleSortChange = async (type: SortType, direction: SortDirection) => {
        try {
            setIsLoading(true);
            setSortType(type);
            setSortDirection(direction);

            // Clear any existing server-side sort when switching to client-side
            if (type === 'none' || type === 'local') {
                const updatedQuery = {
                    ...query,
                    sort: undefined // Remove server-side sort
                };
                onSearchUpdate(updatedQuery, searchResponse);
                setIsLoading(false);
                return;
            }

            // Handle server-side sorts
            const updatedQuery: POE2Query = {
                ...query,
                sort: {
                    [type]: direction
                }
            };

            const response = await axios.post('/api/v2/search/update', {
                query: updatedQuery,
                options: options
            });

            onSearchUpdate(updatedQuery, response.data);
        } catch (error) {
            console.error('Sort error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredResults = useMemo(() => {
        const results = [...(searchResponse.data?.results ?? [])];
        
        // Apply time filters
        const filtered = timeFilter === 'all' 
            ? results
            : results.filter(item => {
                const now = new Date();
                const filterMap = {
                    today: 1,
                    '3days': 3,
                    week: 7,
                };

                const daysAgo = filterMap[timeFilter] || 0;
                const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));
                const itemDate = new Date(item.listing.indexed);
                return itemDate >= cutoffDate;
            });

        // Apply sort only if not 'none'
        if (sortType === 'none') {
            return filtered;
        }

        // Apply sort for local sorting
        if (sortType === 'local') {
            return filtered.sort((a, b) => {
                const dateA = new Date(a.listing.indexed).getTime();
                const dateB = new Date(b.listing.indexed).getTime();
                return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
            });
        }

        return filtered;
    }, [searchResponse.data?.results, timeFilter, sortType, sortDirection]);

    const loading = isLoading;

    return (
        <Tabs defaultValue="items" className="w-full">
            <div className="flex items-center justify-between mb-4">
                <TabsList>
                    <TabsTrigger value="items" className="text-sm">
                        Items
                    </TabsTrigger>
                    <TabsTrigger value="charts" className="text-sm">
                        Charts
                    </TabsTrigger>
                </TabsList>
                {loading && <Loader2 className="h-4 w-4 animate-spin ml-2"/>}
            </div>

            <TabsContent value="items" className="mt-0">
                <div className="rounded-lg bg-background px-4 py-2">
                    <ResultsFilterBar
                        onFilterChange={setTimeFilter}
                        onSortChange={handleSortChange}
                        onCurrencyChange={setPreferredCurrency}
                        activeFilter={timeFilter}
                        activeSortType={sortType}
                        activeSortDir={sortDirection}
                        activeCurrency={preferredCurrency}
                        resultCount={filteredResults?.length ?? 0}
                        totalResults={searchResponse.data?.total ?? 0}
                        isLoading={loading}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                        {filteredResults?.map((result) => (
                            <PoeItem 
                                key={result.item.id} 
                                item={result} 
                                query={query}
                                preferredCurrency={preferredCurrency}
                                exchangeRates={exchangeData?.rates}
                            />
                        ))}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="charts" className="mt-0">
                <div className="rounded-lg bg-background px-4 py-2">
                    <ResultCharts 
                        results={filteredResults} // Change this line to use filteredResults
                        exchangeRates={exchangeData?.rates}
                    />
                </div>
            </TabsContent>
        </Tabs>
    );
};