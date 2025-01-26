import type { MetaFunction } from "@remix-run/node";
import { ChevronDown, Copy, ExternalLink, Loader2, RotateCcw, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Label } from "~/components/ui/label";
import { PoEItemCard } from "~/components/ui/poe-item-card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import flatStats from '~/data/flat_stats.json';
import { useToast } from "~/hooks/use-toast";
import equipmentFilters from '~/data/equipment_filters.json';
import reqFilters from '~/data/req_filters.json';
import typeFilters from '~/data/type_filters.json';
import miscFilters from '~/data/misc_filters.json';

export const meta: MetaFunction = () => {
  return [
    { title: "PoE Item Search" },
    { name: "description", content: "Search Path of Exile items" },
  ];
};

const RANGE_TYPES = {
  MIN_ONLY: "min_only",
  MAX_ONLY: "max_only",
  MINMAX: "minmax",
} as const;

const POE2_TRADE_URL = "https://www.pathofexile.com/trade2/search/poe2/Standard";

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
  const [searchParams, setSearchParams] = useState<SearchRequestBody>({
    input: "",
    rangeType: RANGE_TYPES.MIN_ONLY,
    enableStats: true,
    enabledFilterGroups: {
      type_filters: true,
      req_filters: true,
      equipment_filters: true,
      misc_filters: true,
    },
  });
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { toast } = useToast();
  const [showInputSearch, setShowInputSearch] = useState(false);

  const handleSearch = async (isRefinedSearch = false) => {
    if (!isRefinedSearch && !searchParams.input?.trim()) {
      setError("Input is required");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(isRefinedSearch ? {
          parsedQuery: result.parsedQuery
        } : searchParams),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResult(data);

      // Only update search history for new searches, not refinements
      if (!isRefinedSearch) {
        setSearchHistory((prev) => [searchParams.input!, ...prev.slice(0, 4)]);
        // Hide the input search after a successful initial search
        setShowInputSearch(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSearchParams((prev) => ({ ...prev, input: e.target.value }));
  };

  const handleRangeTypeChange = (value: string) => {
    setSearchParams((prev) => ({ ...prev, rangeType: value }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast({
      title: "Copied to clipboard",
      description: "The search result has been copied to your clipboard.",
    });
  };

  const handleClear = () => {
    setSearchParams({
      input: "",
      rangeType: RANGE_TYPES.MIN_ONLY,
      enableStats: true,
      enabledFilterGroups: {
        type_filters: true,
        req_filters: true,
        equipment_filters: true,
        misc_filters: true,
      },
    });
    setResult(null);
    setError(null);
    setShowInputSearch(true);
  };

  const getTradeUrl = (searchId: string) => {
    return `${POE2_TRADE_URL}/${searchId}`;
  };

  const handleParsedQueryEdit = (newQuery: any) => {
    // Update the result's parsedQuery
    setResult((prev: any) => ({
      ...prev,
      parsedQuery: newQuery
    }));
  };

  // Add a new button to rerun search with modified query
  const handleRerunSearch = () => {
    handleSearch(true);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">PoE Item Search</CardTitle>
            <div className="flex items-center gap-4">
              {/* Recent Searches Popover */}
              {searchHistory.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      Recent Searches
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((item, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            setSearchParams((prev) => ({ ...prev, input: item }));
                            setShowInputSearch(true);
                          }}
                        >
                          {item.slice(0, 30)}...
                        </Badge>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
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
              <Textarea
                value={searchParams.input}
                onChange={handleInputChange}
                placeholder="Enter item details here..."
                className="min-h-[200px] font-mono text-sm"
              />
              <Button onClick={() => handleSearch()} disabled={isSearching} className="w-full">
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </CollapsibleContent>
          </Collapsible>

          {/* Query Editor - Only show when we have a result */}
          {result?.parsedQuery && (
            <Card className="w-full max-w-4xl mx-auto">
              <Collapsible defaultOpen={false}>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-t-lg cursor-pointer">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <h3 className="text-lg font-semibold">Query Editor</h3>
                    </div>
                  </CollapsibleTrigger>
                  <Button
                    onClick={handleRerunSearch}
                    disabled={isSearching}
                    size="sm"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Run Query
                      </>
                    )}
                  </Button>
                </div>

                <CollapsibleContent>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="parsed-stats"
                        checked={result?.parsedQuery?.query?.stats?.length > 0}
                        onCheckedChange={(checked) => {
                          const newQuery = {
                            ...result.parsedQuery,
                            query: {
                              ...result.parsedQuery.query,
                              stats: checked ? result.parsedQuery.query.stats : []
                            }
                          };
                          handleParsedQueryEdit(newQuery);
                        }}
                      />
                      <Label htmlFor="parsed-stats">Stats Filtering</Label>
                    </div>

                    {result?.parsedQuery?.query?.stats?.[0]?.filters?.map((stat: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 ml-4">
                        <Switch
                          id={`stat-${index}`}
                          checked={!stat.disabled}
                          onCheckedChange={(checked) => {
                            const newQuery = {
                              ...result.parsedQuery,
                              query: {
                                ...result.parsedQuery.query,
                                stats: result.parsedQuery.query.stats.map((statGroup: any) => ({
                                  ...statGroup,
                                  filters: statGroup.filters.map((s: any, i: number) =>
                                    i === index ? { ...s, disabled: !checked } : s
                                  )
                                }))
                              }
                            };
                            handleParsedQueryEdit(newQuery);
                          }}
                        />
                        <Label htmlFor={`stat-${index}`} className="text-sm flex-1">
                          {flatStats[stat.id]?.text || stat.id}
                        </Label>
                        <RangeInputs
                          value={stat.value}
                          originalValue={stat.originalValue}
                          onChange={(newValue) => {
                            const newQuery = {
                              ...result.parsedQuery,
                              query: {
                                ...result.parsedQuery.query,
                                stats: result.parsedQuery.query.stats.map((statGroup: any) => ({
                                  ...statGroup,
                                  filters: statGroup.filters.map((s: any, i: number) =>
                                    i === index ? { ...s, value: newValue } : s
                                  )
                                }))
                              }
                            };
                            handleParsedQueryEdit(newQuery);
                          }}
                        />
                      </div>
                    ))}

                    {/* Type Filters Section */}
                    {Object.entries(result?.parsedQuery?.query?.filters || {}).map(([groupKey, group]: [string, any]) => (
                      <div key={groupKey} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold">
                            {getGroupDisplayName(groupKey)}
                          </Label>
                          <Switch
                            id={`filter-group-${groupKey}`}
                            checked={!group.disabled}
                            onCheckedChange={(checked) => {
                              const newQuery = {
                                ...result.parsedQuery,
                                query: {
                                  ...result.parsedQuery.query,
                                  filters: {
                                    ...result.parsedQuery.query.filters,
                                    [groupKey]: {
                                      ...group,
                                      disabled: !checked
                                    }
                                  }
                                }
                              };
                              handleParsedQueryEdit(newQuery);
                            }}
                          />
                        </div>

                        {/* Individual Filter Toggles */}
                        {group.filterStates && Object.entries(group.filterStates).map(([filterKey, isEnabled]: [string, boolean]) => (
                          <div key={filterKey} className="flex items-center space-x-4 ml-4">
                            <Switch
                              id={`filter-${groupKey}-${filterKey}`}
                              checked={isEnabled}
                              onCheckedChange={(checked) => {
                                const newQuery = {
                                  ...result.parsedQuery,
                                  query: {
                                    ...result.parsedQuery.query,
                                    filters: {
                                      ...result.parsedQuery.query.filters,
                                      [groupKey]: {
                                        ...group,
                                        filterStates: {
                                          ...group.filterStates,
                                          [filterKey]: checked
                                        }
                                      }
                                    }
                                  }
                                };
                                handleParsedQueryEdit(newQuery);
                              }}
                            />
                            <Label htmlFor={`filter-${groupKey}-${filterKey}`} className="text-sm flex-1">
                              {getFilterName(groupKey, filterKey)}
                            </Label>
                            {group.filters[filterKey].min !== undefined && (
                              <RangeInputs
                                value={group.filters[filterKey]}
                                originalValue={group.filters[filterKey].originalValue}
                                onChange={(newValue) => {
                                  const newQuery = {
                                    ...result.parsedQuery,
                                    query: {
                                      ...result.parsedQuery.query,
                                      filters: {
                                        ...result.parsedQuery.query.filters,
                                        [groupKey]: {
                                          ...group,
                                          filters: {
                                            ...group.filters,
                                            [filterKey]: {
                                              ...group.filters[filterKey],
                                              ...newValue
                                            }
                                          }
                                        }
                                      }
                                    }
                                  };
                                  handleParsedQueryEdit(newQuery);
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {(result || error) && (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Search Results</CardTitle>
              {result?.matches > 0 && (
                <Badge variant="secondary">
                  {result.matches} {result.matches === 1 ? 'match' : 'matches'} found
                </Badge>
              )}
              {result?.items?.length > 0 && (
                <Badge variant="outline">
                  Showing {result.items.length} items
                </Badge>
              )}
              {result?.searchId && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => window.open(getTradeUrl(result.searchId), '_blank')}
                >
                  Open on PathOfExile Trade
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-destructive">{error}</p>
            ) : (
              <Tabs defaultValue="details" className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="raw">Raw</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result?.items?.map((item: any, index: number) => (
                      <PoEItemCard
                        key={index}
                        item={item.item}
                        listing={item.listing}
                      />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="raw">
                  <div className="space-y-4">
                    <Collapsible>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Parsed Query</h3>
                        <div className="flex items-center space-x-2">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </CollapsibleTrigger>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRerunSearch}
                            disabled={isSearching}
                          >
                            {isSearching ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Rerun Search"
                            )}
                          </Button>
                        </div>
                      </div>
                      <CollapsibleContent>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="parsed-stats"
                              checked={result?.parsedQuery?.query?.stats?.length > 0}
                              onCheckedChange={(checked) => {
                                const newQuery = {
                                  ...result.parsedQuery,
                                  query: {
                                    ...result.parsedQuery.query,
                                    stats: checked ? result.parsedQuery.query.stats : []
                                  }
                                };
                                handleParsedQueryEdit(newQuery);
                              }}
                            />
                            <Label htmlFor="parsed-stats">Stats Filtering</Label>
                          </div>

                          {result?.parsedQuery?.query?.stats?.[0]?.filters?.map((stat: any, index: number) => (
                            <div key={index} className="flex items-center space-x-4 ml-4">
                              <Switch
                                id={`stat-${index}`}
                                checked={!stat.disabled}
                                onCheckedChange={(checked) => {
                                  const newQuery = {
                                    ...result.parsedQuery,
                                    query: {
                                      ...result.parsedQuery.query,
                                      stats: result.parsedQuery.query.stats.map((statGroup: any) => ({
                                        ...statGroup,
                                        filters: statGroup.filters.map((s: any, i: number) =>
                                          i === index ? { ...s, disabled: !checked } : s
                                        )
                                      }))
                                    }
                                  };
                                  handleParsedQueryEdit(newQuery);
                                }}
                              />
                              <Label htmlFor={`stat-${index}`} className="text-sm flex-1">
                                {flatStats[stat.id]?.text || stat.id}
                              </Label>
                              <RangeInputs
                                value={stat.value}
                                originalValue={stat.originalValue}
                                onChange={(newValue) => {
                                  const newQuery = {
                                    ...result.parsedQuery,
                                    query: {
                                      ...result.parsedQuery.query,
                                      stats: result.parsedQuery.query.stats.map((statGroup: any) => ({
                                        ...statGroup,
                                        filters: statGroup.filters.map((s: any, i: number) =>
                                          i === index ? { ...s, value: newValue } : s
                                        )
                                      }))
                                    }
                                  };
                                  handleParsedQueryEdit(newQuery);
                                }}
                              />
                            </div>
                          ))}

                          <div className="grid gap-2">
                            {Object.entries(result?.parsedQuery?.query?.filters || {}).map(([key, value]: [string, any]) => (
                              <div key={key} className="flex items-center space-x-2">
                                <Switch
                                  id={`parsed-${key}`}
                                  checked={!value.disabled}
                                  onCheckedChange={(checked) => {
                                    const newQuery = {
                                      ...result.parsedQuery,
                                      query: {
                                        ...result.parsedQuery.query,
                                        filters: {
                                          ...result.parsedQuery.query.filters,
                                          [key]: {
                                            ...value,
                                            disabled: !checked
                                          }
                                        }
                                      }
                                    };
                                    handleParsedQueryEdit(newQuery);
                                  }}
                                />
                                <Label htmlFor={`parsed-${key}`}>{key.replace(/_/g, ' ')}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          {result && (
            <CardFooter>
              <Button onClick={handleCopy} variant="outline" className="ml-auto">
                <Copy className="mr-2 h-4 w-4" />
                Copy Result
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
