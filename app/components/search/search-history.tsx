import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Badge } from "~/components/ui/badge";

interface SearchHistoryProps {
    history: string[];
    onSelect: (item: string) => void;
}

export function SearchHistory({ history, onSelect }: SearchHistoryProps) {
    if (history.length === 0) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                    Recent Searches
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="flex flex-wrap gap-2">
                    {history.map((item, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => onSelect(item)}
                        >
                            {item.length > 30 ? `${item.slice(0, 30)}...` : item}
                        </Badge>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
} 