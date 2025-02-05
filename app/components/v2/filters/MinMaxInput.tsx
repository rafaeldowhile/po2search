import { Path, useFormContext } from "react-hook-form";
import { Checkbox } from "~/components/ui/checkbox";
import { FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { POE2Query } from "~/lib/poe2-query-schema";

interface MinMaxInputProps {
    label: string;
    path: Path<POE2Query>;
}

export const MinMaxInput = ({ label, path }: MinMaxInputProps) => {
    const form = useFormContext<POE2Query>();
    return (
        <>
            <div className="flex flex-row items-center justify-between gap-1">
                <Label className="flex-1 text-xs text-muted-foreground">{label}</Label>
                <FormField
                    control={form.control}
                    name={`${path}.min` as Path<POE2Query>}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    value={String(field.value ?? '')}
                                    placeholder="min"
                                    onChange={({ target }) => {
                                        field.onChange(target.value === '' ? null : target.valueAsNumber);
                                    }}
                                    className="w-16 h-6 text-xs transition-colors hover:border-primary px-1"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={`${path}.max` as Path<POE2Query>}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    value={String(field.value ?? '')}
                                    placeholder="max"
                                    onChange={({ target }) => {
                                        field.onChange(target.value === '' ? null : target.valueAsNumber);
                                    }}
                                    className="w-16 h-6 text-xs transition-colors hover:border-primary px-1"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </>
    )
}