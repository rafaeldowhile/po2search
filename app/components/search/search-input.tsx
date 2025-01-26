import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Loader2, Search } from "lucide-react";
import type { RangeType } from "~/types/search";
import { memo } from 'react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    rangeType: RangeType;
    onRangeTypeChange: (value: RangeType) => void;
    onSearch: () => void;
    isSearching: boolean;
    className?: string;
}

export const SearchInput = memo(function SearchInput({
    value,
    onChange,
    rangeType,
    onRangeTypeChange,
    onSearch,
    isSearching,
    className = "",
}: SearchInputProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onSearch();
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Hover over an item in-game, press Ctrl+C, then paste the item data here"
                className="w-full min-h-[100px] p-3 text-sm bg-background border rounded-md resize-y"
                onKeyDown={handleKeyDown}
            />
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Select value={rangeType} onValueChange={onRangeTypeChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select range type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="min_only">Minimum Values Only</SelectItem>
                            <SelectItem value="max_only">Maximum Values Only</SelectItem>
                            <SelectItem value="minmax">Min and Max Values</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                        Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter to search
                    </p>
                </div>
                <Button onClick={onSearch} disabled={isSearching} className="w-32">
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
            </div>
        </div>
    );
}); 