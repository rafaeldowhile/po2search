import { InfoIcon, MailIcon, Sparkles } from "lucide-react";
import type { ServerRuntimeMetaFunction as MetaFunction } from "@remix-run/server-runtime";
import { useState } from "react";
import { KeyboardShortcuts } from "~/components/keyboard-shortcuts";
import { SearchHistory } from "~/components/search/search-history";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { NoResultsFound } from "~/components/v2/NoResultsFound";
import { QueryEditor } from "~/components/v2/QueryEditor";
import { Results } from "~/components/v2/Results";
import { SearchForm } from "~/components/v2/SearchForm";
import { Item } from "~/lib/models/item";
import { POE2Query } from "~/lib/poe2-query-schema";
import { QueryOptions, SearchResponse } from "~/lib/types";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const meta: MetaFunction = () => {
    return [
        { title: "PoE2 Trade Search" },
        { name: "description", content: "Search Path of Exile items" },
    ];
};

const WhatsNewDialog = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">v1.1</span>
                    <button className="text-xs flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse hover:animate-none hover:bg-primary/20 transition-colors">
                        <Sparkles className="w-3 h-3" />
                        <span>NEW</span>
                    </button>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>What's New in v1.1</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            We're excited to introduce new features that will help you analyze item prices and filter results more effectively:
                        </p>
                        <div className="text-sm space-y-2">
                            <ul className="list-disc list-inside space-y-2">
                                <li>New Charts tab with detailed price analysis</li>
                                <li>Price distribution visualization</li>
                                <li>Price clustering to identify common price points</li>
                                <li>Advanced statistics including mean, median, and mode</li>
                                <li>Enhanced filtering options:
                                    <ul className="list-circle list-inside ml-4 mt-1 space-y-1">
                                        <li>Time-based filters (today, 3 days, week)</li>
                                        <li>Improved sorting options (price, date)</li>
                                        <li>Better currency conversion display</li>
                                    </ul>
                                </li>
                                <li>Improved performance and stability</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="font-medium">Coming Soon</h3>
                        <div className="text-sm space-y-2">
                            <div className="flex items-start gap-2 p-3 rounded-md bg-primary/5 border border-primary/20">
                                <Sparkles className="w-4 h-4 mt-0.5 text-primary" />
                                <div>
                                    <p className="font-medium">Custom Queries with Weighted Values</p>
                                    <p className="text-muted-foreground mt-1">
                                        Create advanced searches with weighted mod values to find items that best match your specific requirements. Perfect for finding optimal gear upgrades.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
                        <InfoIcon className="w-4 h-4 mt-0.5 text-blue-500" />
                        <p className="text-sm text-muted-foreground">
                            The charts feature is in beta. We're continuously working to improve its accuracy and add more analysis tools.
                        </p>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex items-start gap-2 text-sm">
                            <MailIcon className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            <div className="space-y-1">
                                <p className="font-medium">Get in Touch</p>
                                <p className="text-muted-foreground">
                                    Have feedback about the new features? Contact us at{" "}
                                    <a
                                        href="mailto:poe2search@gmail.com"
                                        className="text-primary hover:underline"
                                    >
                                        poe2search@gmail.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const Header = () => {
    const shortcuts = [
        { key: 'alt + n', description: 'New search' },
        { key: 'alt + c', description: 'Clear search' },
    ];

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold">PoE2 Trade Search</h1>
                    <WhatsNewDialog />
                </div>
                <p className="text-sm text-muted-foreground">
                    A simple tool to help you price check and find upgrades for your Path of Exile 2 items.
                </p>
                <small className=" text-muted-foreground">
                    * Currently supports only English version
                </small>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <ThemeToggle />
                    <KeyboardShortcuts shortcuts={shortcuts} />
                    <SearchHistory history={[]} onSelect={() => { }} />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="flex-1 sm:flex-none bg-background hover:bg-accent hover:text-accent-foreground"
                    >
                        New Search
                    </Button>
                </div>
            </div>
        </div>
    )
}

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
        },
    },
});

export default function Index() {
    const [query, setQuery] = useState<POE2Query>();
    const [item, setItem] = useState<Item>();
    const [searchResponse, setSearchResponse] = useState<SearchResponse>();
    const [searchFormVisible, setSearchFormVisible] = useState(true);
    const [options, setOptions] = useState<QueryOptions>();

    const onSuccess = (response: SearchResponse, options: QueryOptions) => {
        setItem(response.item);
        setQuery(response.query);
        setSearchResponse(response);
        setOptions(options);
        setSearchFormVisible(false);
    }

    const onSearchUpdate = (response: SearchResponse) => {
        setSearchResponse(response);
    }

    const handleQueryUpdate = async (newQuery: POE2Query, response: SearchResponse) => {
        setQuery(newQuery);
        setSearchResponse(response);
    };

    const renderContent = () => {
        if (!query || !searchResponse) {
            return <SearchForm onSuccess={onSuccess} />;
        }
 
        return (
            <>
                <QueryEditor
                    item={item!}
                    query={query}
                    onSearchUpdate={onSearchUpdate}
                    options={options}
                />

                {searchResponse.data?.results?.length > 0 ? (
                    <Results
                        searchResponse={searchResponse}
                        query={query}
                        options={options!}
                        onSearchUpdate={handleQueryUpdate}
                    />
                ) : (
                    <NoResultsFound
                        query={query}
                        options={options!}
                        searchId={searchResponse.data?.id}
                        onUpdateQuery={handleQueryUpdate}
                    />
                )}
            </>
        );
    };

    return (
        <QueryClientProvider client={queryClient}>
            <div className="container mx-auto px-2 sm:px-4 py-4 space-y-6 sm:space-y-8 max-w-[1400px] min-h-screen bg-background text-foreground">
                <Header />
                {renderContent()}
            </div>
        </QueryClientProvider>
    )
}