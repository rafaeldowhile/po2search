import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import type { FilterGroup as FilterGroupType } from "~/types/search";
import { RangeInputs } from "./range-inputs";
import { getFilterName, getGroupDisplayName } from "~/lib/filters";

interface FilterGroupProps {
    groupKey: string;
    group: FilterGroupType;
    onUpdate: (filterKey: string, updates: Partial<{ enabled: boolean; min?: number; max?: number }>) => void;
}

export function FilterGroup({ groupKey, group, onUpdate }: FilterGroupProps) {
    return (
        <div className="space-y-2">
            <Label className="text-base font-semibold">
                {getGroupDisplayName(groupKey)}
            </Label>

            {Object.entries(group.filterStates).map(([filterKey, isEnabled]) => (
                <div key={filterKey} className="flex items-center space-x-4 ml-4">
                    <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => onUpdate(filterKey, { enabled: checked })}
                    />
                    <Label className="text-sm flex-1">
                        {getFilterName(groupKey, filterKey)}
                    </Label>
                    {group.filters[filterKey].min !== undefined && (
                        <RangeInputs
                            value={group.filters[filterKey]}
                            originalValue={group.filters[filterKey].originalValue}
                            onChange={(value) => onUpdate(filterKey, value)}
                        />
                    )}
                </div>
            ))}
        </div>
    );
} 