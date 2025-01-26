import type { RangeValue } from "~/types/search";

interface RangeInputsProps {
    value: RangeValue;
    originalValue?: RangeValue;
    onChange: (newValue: RangeValue) => void;
}

export function RangeInputs({
    value,
    originalValue,
    onChange
}: RangeInputsProps) {
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