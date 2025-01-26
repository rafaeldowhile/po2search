import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import type { StatFilter as StatFilterType } from "~/types/search";
import { RangeInputs } from "./range-inputs";
import flatStats from "~/data/flat_stats.json";

interface StatFilterProps {
    stat: StatFilterType;
    onUpdate: (updates: Partial<{ disabled: boolean; value: { min?: number; max?: number } }>) => void;
}

export function StatFilter({ stat, onUpdate }: StatFilterProps) {
    return (
        <div className="flex items-center space-x-4 ml-4">
            <Switch
                checked={!stat.disabled}
                onCheckedChange={(checked) => onUpdate({ disabled: !checked })}
            />
            <Label className="text-sm flex-1">
                {flatStats[stat.id]?.text || stat.id}
            </Label>
            <RangeInputs
                value={stat.value}
                originalValue={stat.value.originalValue}
                onChange={(value) => onUpdate({ value })}
            />
        </div>
    );
} 