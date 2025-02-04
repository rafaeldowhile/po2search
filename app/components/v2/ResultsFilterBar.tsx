import { AlertTriangle, Clock, CoinsIcon, CalendarDays, ListIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { CurrencySelect } from "./CurrencySelect";

export type TimeFilter = 'today' | '3days' | 'week' | 'all';
export type SortDirection = 'asc' | 'desc';
export type SortType = 'indexed' | 'price' | 'local' | 'none';

interface ResultsFilterBarProps {
    onFilterChange: (filter: TimeFilter) => void;
    onSortChange: (type: SortType, direction: SortDirection) => void;
    onCurrencyChange: (currency: string) => void;
    activeFilter: TimeFilter;
    activeSortType: SortType;
    activeSortDir: SortDirection;
    activeCurrency: string;
    resultCount: number;
    totalResults: number;
    isLoading?: boolean;
}

export const ResultsFilterBar = ({ 
    onFilterChange, 
    onSortChange,
    onCurrencyChange,
    activeFilter,
    activeSortType,
    activeSortDir,
    activeCurrency,
    resultCount,
    totalResults,
    isLoading = false
}: ResultsFilterBarProps) => {
    const hasMoreResults = totalResults > 100;

    const sortOptions = [
        { 
            id: 'none-none', 
            label: 'No order', 
            type: 'none' as const, 
            dir: 'desc' as const, 
            serverSide: false, 
            icon: ListIcon,
            description: 'Original order from API'
        },
        { id: 'local-desc', label: 'Date: Newest first', type: 'local' as const, dir: 'desc' as const, serverSide: false, icon: CalendarDays },
        { id: 'local-asc', label: 'Date: Oldest first', type: 'local' as const, dir: 'asc' as const, serverSide: false, icon: CalendarDays },
        // Server-side sorts (only shown when totalResults > 100)
        { id: 'indexed-desc', label: 'Newest first (API)', type: 'indexed' as const, dir: 'desc' as const, serverSide: true, icon: Clock },
        { id: 'indexed-asc', label: 'Oldest first (API)', type: 'indexed' as const, dir: 'asc' as const, serverSide: true, icon: Clock },
        { id: 'price-asc', label: 'Price: Low to High', type: 'price' as const, dir: 'asc' as const, serverSide: true, icon: CoinsIcon },
        { id: 'price-desc', label: 'Price: High to Low', type: 'price' as const, dir: 'desc' as const, serverSide: true, icon: CoinsIcon },
    ];

    const currentSortId = `${activeSortType}-${activeSortDir}`;
    const visibleSortOptions = sortOptions.filter(opt => 
        (!opt.serverSide || hasMoreResults) && 
        !(activeSortType === 'local' && opt.serverSide)
    );

    return (
        <div className="space-y-2">
            {hasMoreResults && (
                <div className="flex items-center gap-2 p-2 text-xs bg-yellow-500/10 border border-yellow-500/20 rounded-md text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <div>
                        <p className="font-medium">Found +{totalResults} items but only showing first 100 results</p>
                        <p className="text-muted-foreground">Try adding more specific filters to narrow down your search</p>
                    </div>
                </div>
            )}
            
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        Showing {resultCount} {hasMoreResults ? 'of ' + totalResults : ''} items
                    </span>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2">
                        <Button
                            variant={activeFilter === 'today' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => onFilterChange('today')}
                        >
                            Posted today
                        </Button>
                        <Button
                            variant={activeFilter === '3days' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => onFilterChange('3days')}
                        >
                            Last 3 days
                        </Button>
                        <Button
                            variant={activeFilter === 'week' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => onFilterChange('week')}
                        >
                            Last week
                        </Button>
                        <Button
                            variant={activeFilter === 'all' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => onFilterChange('all')}
                        >
                            Show all
                        </Button>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="currency" className="text-sm font-medium">
                            Show prices in
                        </Label>
                        <CurrencySelect
                            value={activeCurrency}
                            onValueChange={onCurrencyChange}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Label htmlFor="sort" className="text-sm font-medium">
                            Sort by
                        </Label>
                        <Select
                            disabled={isLoading}
                            value={currentSortId}
                            onValueChange={(value) => {
                                const option = sortOptions.find(opt => opt.id === value);
                                if (option) {
                                    onSortChange(option.type, option.dir);
                                }
                            }}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Choose sort order">
                                    {sortOptions.find(opt => opt.id === currentSortId)?.label}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {visibleSortOptions.map((option) => (
                                    <SelectItem key={option.id} value={option.id}>
                                        <span className="flex items-center gap-2">
                                            <option.icon className="h-3 w-3" />
                                            {option.label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
};
