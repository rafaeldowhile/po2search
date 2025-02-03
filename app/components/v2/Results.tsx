import { useState, useMemo } from "react";
import { SearchResponse } from "~/lib/types";
import { PoeItem } from "./PoeItem";
import { POE2Query } from "~/lib/poe2-query-schema";
import { ResultsFilterBar, TimeFilter, SortDirection } from "./ResultsFilterBar";

interface ResultsProps {
    searchResponse: SearchResponse;
    query: POE2Query;
}

export const Results = ({ searchResponse, query }: ResultsProps) => {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all'); // Changed default to 'all'
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const filteredResults = useMemo(() => {
        const results = timeFilter === 'all' 
            ? [...(searchResponse.data?.results ?? [])]
            : searchResponse.data?.results.filter(item => {
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

        // Sort results by date
        return results?.sort((a, b) => {
            const dateA = new Date(a.listing.indexed).getTime();
            const dateB = new Date(b.listing.indexed).getTime();
            return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }, [searchResponse.data?.results, timeFilter, sortDirection]);

    return (
        <div className="w-full rounded-lg bg-background px-4 py-2">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-md font-semibold">Results</h1>
            </div>

            <ResultsFilterBar 
                onFilterChange={setTimeFilter}
                onSortChange={setSortDirection}
                activeFilter={timeFilter}
                activeSort={sortDirection}
                resultCount={filteredResults?.length ?? 0}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredResults?.map((result, index) => (
                    <PoeItem key={result.item.id} item={result} query={query}/>
                ))}
            </div>
        </div>
    );
};