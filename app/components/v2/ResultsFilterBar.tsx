import { Button } from "~/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

export type TimeFilter = 'today' | '3days' | 'week' | 'all';
export type SortDirection = 'asc' | 'desc';

interface ResultsFilterBarProps {
    onFilterChange: (filter: TimeFilter) => void;
    onSortChange: (direction: SortDirection) => void;
    activeFilter: TimeFilter;
    activeSort: SortDirection;
    resultCount: number;
}

export const ResultsFilterBar = ({ 
    onFilterChange, 
    onSortChange,
    activeFilter, 
    activeSort,
    resultCount 
}: ResultsFilterBarProps) => {
    return (
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                    {resultCount} results found
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
            
            <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onSortChange(activeSort === 'desc' ? 'asc' : 'desc')}
            >
                <ArrowUpDown className="h-3 w-3 mr-1.5" />
                {activeSort === 'desc' ? 'Newest first' : 'Oldest first'}
            </Button>
        </div>
    );
};
