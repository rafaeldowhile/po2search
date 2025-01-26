import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Loader2, Search } from "lucide-react";
import type { SearchParams } from "~/types/search";
import { memo } from 'react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
    isSearching: boolean;
    className?: string;
}

export const SearchInput = memo(function SearchInput({
    value,
    onChange,
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
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter item details here..."
                className="min-h-[200px] font-mono text-sm"
                onKeyDown={handleKeyDown}
            />
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + Enter to search
                </p>
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