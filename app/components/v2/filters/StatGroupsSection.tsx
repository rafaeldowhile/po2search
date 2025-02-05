import { Path, useFieldArray, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { POE2Query, StatGroupTypeLabels, StatGroupTypes } from "~/lib/poe2-query-schema";
import { createEmptyStatItem } from "~/lib/utils/query-helpers";
import { StatInputSelect } from "./StatInputSelect";
import { Button } from "~/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { SchemaFormField } from "./SchemaFormField";
import { FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

const StatGroup = ({
    index,
    onRemove
}: {
    index: number;
    onRemove: () => void;
}) => {
    const form = useFormContext<POE2Query>();
    const { fields, append, remove } = useFieldArray({
        name: `query.stats.${index}.filters`,
        control: form.control
    });

    const groupType = form.watch(`query.stats.${index}.type`) as StatGroupTypes;

    const renderTypeSpecificInput = () => {
        switch (groupType) {
            case 'count':
            case 'weight':
            case 'weight2':
                return (
                    <div className="flex-1">
                        <SchemaFormField
                            path={`query.stats.${index}.value`}
                            schemaType="minMax"
                            label=""
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <Select
                        value={groupType}
                        onValueChange={(value: StatGroupTypes) => {
                            form.setValue(`query.stats.${index}.type`, value, {
                                shouldDirty: true
                            });
                        }}
                    >
                        <SelectTrigger className="h-6 w-24 text-xs transition-colors hover:border-primary px-2">
                            <SelectValue placeholder="Filter type" className="h-13" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(StatGroupTypeLabels).map(([value, label], index) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {renderTypeSpecificInput()}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className="h-8 w-8"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-2">
                {fields.map((field, filterIndex) => (
                    <StatInputSelect
                        key={field.id}
                        groupIndex={index}
                        index={filterIndex}
                        onRemove={() => remove(filterIndex)}
                    />
                ))}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => append(createEmptyStatItem())}
                >
                    Add Stat
                </Button>
            </div>
        </Card>
    );
};

export const StatGroupsSection = () => {
    const form = useFormContext<POE2Query>();

    const statGroups = useFieldArray({
        name: 'query.stats',
        control: form.control
    });

    const addStatsGroup = () => {
        statGroups.append({
            type: 'and',
            disabled: false,
            filters: [createEmptyStatItem()]
        })
    }

    return (
        <Card className="flex flex-col gap-1 bg-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between m-0 p-0 px-2 pt-2">
                <CardTitle className="text-[14px]">Stat Groups</CardTitle>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={addStatsGroup}
                    className="h-8 w-8"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-0 pb-2 px-2">
                <div className="space-y-4">
                    {statGroups.fields.map((group, index) => (
                        <StatGroup
                            key={group.id}
                            index={index}
                            onRemove={() => statGroups.remove(index)}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}