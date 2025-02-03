import { SearchResponse } from "~/lib/types";
import { PoeItem } from "./PoeItem";
import { POE2Query } from "~/lib/poe2-query-schema";

interface ResultsProps {
    searchResponse: SearchResponse;
    query: POE2Query;
}
export const Results = ({ searchResponse, query }: ResultsProps) => {
    return (
        <div className="w-full rounded-lg bg-background px-4 py-2">
            <div className="flex items-center justify-between">
                <h1 className="text-md font-semibold">Results</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResponse.data?.results.map((result, index) => (
                    <PoeItem key={index} item={result} query={query}/>
                ))}
            </div>
        </div>
    )
}