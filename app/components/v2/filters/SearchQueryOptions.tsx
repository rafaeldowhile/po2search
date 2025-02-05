import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { QueryLeague, QueryLeagueLabels, QueryOptions, QueryStatus, QueryStatusLabels } from "~/lib/types";

interface SearchQueryOptionsProps {
    options: QueryOptions;
    onOptionsChange: (options: QueryOptions) => void;
}

export const SearchQueryOptions = ({ options, onOptionsChange }: SearchQueryOptionsProps) => {
    return (
        <div className="flex flex-row gap-4 mr-4">
            <div className="flex flex-row items-center gap-2">
                <Label htmlFor="league" className="text-[12px] font-medium">League</Label>
                <Select
                    value={options.league}
                    onValueChange={(value) => onOptionsChange({
                        ...options,
                        league: value as QueryLeague
                    })}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select league" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(QueryLeagueLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-row items-center gap-2">
                <Label htmlFor="status" className="text-[12px] font-medium">Status</Label>
                <Select
                    value={options.status}
                    onValueChange={(value) => onOptionsChange({
                        ...options,
                        status: value as QueryStatus
                    })}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(QueryStatusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};