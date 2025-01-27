import type { MetaFunction } from "@remix-run/node";
import { RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";
import { useHotkeys } from 'react-hotkeys-hook';
import { KeyboardShortcuts } from "~/components/keyboard-shortcuts";
import { QueryEditor } from "~/components/search/query-editor/query-editor";
import { ResultsView } from "~/components/search/results-view";
import { SearchGuide } from "~/components/search/search-guide";
import { SearchHistory } from "~/components/search/search-history";
import { SearchInput } from "~/components/search/search-input";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Collapsible, CollapsibleContent } from "~/components/ui/collapsible";
import { useSearch } from "~/hooks/use-search";
import { useSearchHistory } from "~/hooks/use-search-history";
import { useSearchParams } from "~/hooks/use-search-params";
import { useToast } from "~/hooks/use-toast";
import type { ParsedQuery } from "~/types/search";

export const meta: MetaFunction = () => {
  return [
    { title: "PoE2 Trade Search" },
    { name: "description", content: "Search Path of Exile items" },
  ];
};

export default function Index() {
  const [showInputSearch, setShowInputSearch] = useState(true);
  const { toast } = useToast();
  const {
    searchParams,
    updateInput,
    updateParsedQuery,
    resetParams,
    updateSearchParams,
  } = useSearchParams();

  const {
    search,
    isSearching,
    error,
    result,
    validationErrors,
    retryCount,
    reset,
  } = useSearch();
  const { searchHistory, addToHistory } = useSearchHistory();

  const [editedQuery, setEditedQuery] = useState<ParsedQuery | null>(null);

  const handleInputChange = useCallback((value: string) => {
    updateInput(value);
  }, [updateInput]);

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast({
      title: "Copied to clipboard",
      description: "The search result has been copied to your clipboard.",
    });
  }, [result, toast]);

  const handleClear = useCallback(() => {
    resetParams();
    setEditedQuery(null);
    setShowInputSearch(true);
    reset();
  }, [resetParams, reset]);

  const handleNewSearch = useCallback(() => {
    // Reset all search params and states
    resetParams();
    setEditedQuery(null);
    setShowInputSearch(true);
    updateParsedQuery(null);
    reset();

    // Reset search results and state
    search({
      input: '',
      parsedQuery: null,
      rangeType: 'min_only'
    });
  }, [resetParams, updateParsedQuery, reset, search]);

  const handleParsedQueryEdit = useCallback((newQuery: ParsedQuery) => {
    setEditedQuery(newQuery);
  }, []);

  const handleRunQuery = useCallback(() => {
    if (editedQuery) {
      search({
        ...searchParams,
        parsedQuery: editedQuery,
      }, true);
    }
  }, [editedQuery, searchParams, search]);

  const handleHistorySelect = useCallback((item: string) => {
    updateInput(item);
    setShowInputSearch(true);
  }, [updateInput]);

  // Define hotkeys
  useHotkeys('shift+/', () => setShowInputSearch(true), {
    description: 'Focus search input',
    enableOnFormTags: false,
  });

  useHotkeys('alt+n', handleNewSearch, {
    description: 'New search',
    enableOnFormTags: false,
  });

  useHotkeys('alt+r', () => handleRunQuery(), {
    description: 'Rerun search',
    enableOnFormTags: false,
  });

  useHotkeys('alt+c', handleClear, {
    description: 'Clear search',
    enableOnFormTags: false,
  });

  useHotkeys('esc', () => setShowInputSearch(false), {
    description: 'Close search input',
    enableOnFormTags: true,
  });

  // Get all registered hotkeys for the help dialog
  const shortcuts = [
    { key: 'shift + /', description: 'Focus search input' },
    { key: 'alt + n', description: 'New search' },
    { key: 'alt + r', description: 'Rerun search' },
    { key: 'alt + c', description: 'Clear search' },
    { key: 'esc', description: 'Close search input' },
  ];

  const handleSearch = async (isRefinedSearch = false) => {
    if (isRefinedSearch) {
      await search({ ...searchParams, parsedQuery: result?.parsedQuery }, true);
    } else {
      await search(searchParams);
      if (searchParams.input) {
        addToHistory(searchParams.input);
        setShowInputSearch(false);
      }
    }

    // Show validation errors if any
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toast({
          title: "Validation Error",
          description: `${error.field}: ${error.message}`,
          variant: "destructive",
        });
      });
      return;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8 max-w-[1400px]">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">PoE2 Trade Search</CardTitle>
              <p className="text-sm text-muted-foreground">
                A simple tool to help you price check and find upgrades for your Path of Exile 2 items.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <KeyboardShortcuts shortcuts={shortcuts} />
              <SearchHistory
                history={searchHistory}
                onSelect={handleHistorySelect}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewSearch}
              >
                {showInputSearch ? "Hide Input" : "New Search"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Collapsible open={showInputSearch}>
            <CollapsibleContent className="space-y-4">
              <SearchInput
                value={searchParams.input || ""}
                onChange={handleInputChange}
                rangeType={searchParams.rangeType || "min_only"}
                onRangeTypeChange={(value) => updateSearchParams({ rangeType: value })}
                onSearch={() => handleSearch()}
                isSearching={isSearching}
              />
              {!result && !isSearching && !error && (
                <SearchGuide />
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Query Editor */}
          {result?.parsedQuery && !showInputSearch && (
            <QueryEditor
              parsedQuery={editedQuery ?? result.parsedQuery}
              onQueryChange={handleParsedQueryEdit}
              onSearch={handleRunQuery}
              isSearching={isSearching}
            />
          )}

          <ResultsView
            result={result}
            error={error}
            onCopy={handleCopy}
            isLoading={isSearching}
            onOpenQueryEditor={() => {
              const queryEditor = document.querySelector('[data-query-editor-trigger]');
              if (queryEditor instanceof HTMLElement) {
                queryEditor.click();
              }
            }}
            parsedQuery={editedQuery || result?.parsedQuery}
          />
        </CardContent>
      </Card>
    </div>
  );
}
