import type { MetaFunction } from "@remix-run/node";
import { RotateCcw } from "lucide-react";
import { useState, useCallback } from "react";
import { useHotkeys } from 'react-hotkeys-hook';
import { KeyboardShortcuts } from "~/components/keyboard-shortcuts";
import { QueryEditor } from "~/components/search/query-editor/query-editor";
import { ResultsView } from "~/components/search/results-view";
import { SearchHistory } from "~/components/search/search-history";
import { SearchInput } from "~/components/search/search-input";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Collapsible, CollapsibleContent } from "~/components/ui/collapsible";
import { DEFAULT_SEARCH_PARAMS, RANGE_TYPES } from "~/constants/search";
import equipmentFilters from '~/data/equipment_filters.json';
import miscFilters from '~/data/misc_filters.json';
import reqFilters from '~/data/req_filters.json';
import typeFilters from '~/data/type_filters.json';
import { useSearch } from "~/hooks/use-search";
import { useSearchHistory } from "~/hooks/use-search-history";
import { useToast } from "~/hooks/use-toast";
import type { ParsedQuery, SearchParams } from "~/types/search";
import { useSearchParams } from "~/hooks/use-search-params";

export const meta: MetaFunction = () => {
  return [
    { title: "PoE Item Search" },
    { name: "description", content: "Search Path of Exile items" },
  ];
};

interface SearchRequestBody {
  input?: string;
  rangeType?: string;
  enableStats?: boolean;
  enabledFilterGroups?: {
    type_filters?: boolean;
    req_filters?: boolean;
    equipment_filters?: boolean;
    misc_filters?: boolean;
  };
  parsedQuery?: any;
}

// Add this component for range inputs
function RangeInputs({
  value,
  originalValue,
  onChange
}: {
  value: { min?: number; max?: number; };
  originalValue?: { min?: number; max?: number; };
  onChange: (newValue: { min?: number; max?: number; }) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="number"
        className="w-20 h-8 rounded-md border border-input px-2"
        placeholder={originalValue?.min?.toString() || "min"}
        value={value.min || ""}
        onChange={(e) => {
          const min = e.target.value ? Number(e.target.value) : undefined;
          onChange({ ...value, min });
        }}
      />
      <span>-</span>
      <input
        type="number"
        className="w-20 h-8 rounded-md border border-input px-2"
        placeholder={originalValue?.max?.toString() || "max"}
        value={value.max || ""}
        onChange={(e) => {
          const max = e.target.value ? Number(e.target.value) : undefined;
          onChange({ ...value, max });
        }}
      />
    </div>
  );
}

// Add interfaces to type the filter data
interface FilterItem {
  id: string;
  text: string;
  minMax?: boolean;
}

interface TypeFilters {
  id: string;
  title: string;
  filters: FilterItem[];
}

// Update the helper function with proper typing
const getFilterName = (groupKey: string, filterId: string): string => {
  if (groupKey === "equipment_filters") {
    const filter = (equipmentFilters as FilterItem[]).find(f => f.id === filterId);
    return filter?.text || filterId.replace(/_/g, ' ');
  }
  if (groupKey === "req_filters") {
    const filter = (reqFilters as FilterItem[]).find(f => f.id === filterId);
    return filter?.text || filterId.replace(/_/g, ' ');
  }
  if (groupKey === "type_filters") {
    const filter = (typeFilters as TypeFilters).filters.find(f => f.id === filterId);
    return filter?.text || filterId.replace(/_/g, ' ');
  }
  if (groupKey === "misc_filters") {
    const filter = (miscFilters as FilterItem[]).find(f => f.id === filterId);
    return filter?.text || filterId.replace(/_/g, ' ');
  }
  return filterId.replace(/_/g, ' ');
};

// Add helper to convert filter group names to display format
const getGroupDisplayName = (groupKey: string): string => {
  switch (groupKey) {
    case "equipment_filters":
      return "Equipment";
    case "req_filters":
      return "Requirements";
    case "type_filters":
      return "Type";
    case "misc_filters":
      return "Miscellaneous";
    default:
      return groupKey.split('_')[0].charAt(0).toUpperCase() +
        groupKey.split('_')[0].slice(1);
  }
};

export default function Index() {
  const [showInputSearch, setShowInputSearch] = useState(false);
  const { toast } = useToast();
  const {
    searchParams,
    updateInput,
    updateParsedQuery,
    resetParams
  } = useSearchParams();

  const {
    search,
    isSearching,
    error,
    result,
    validationErrors,
    retryCount,
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
    setShowInputSearch(true);
  }, [resetParams]);

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

  useHotkeys('alt+n', () => setShowInputSearch(!showInputSearch), {
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
    <div className="container mx-auto p-4 space-y-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">PoE Item Search</CardTitle>
            <div className="flex items-center gap-4">
              <KeyboardShortcuts shortcuts={shortcuts} />
              <SearchHistory
                history={searchHistory}
                onSelect={handleHistorySelect}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInputSearch(!showInputSearch)}
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
                onSearch={() => handleSearch()}
                isSearching={isSearching}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Query Editor */}
          {result?.parsedQuery && (
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
          />
        </CardContent>
      </Card>
    </div>
  );
}
