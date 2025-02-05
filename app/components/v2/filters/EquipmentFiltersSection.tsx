import { usePoeCategories, usePoeRarities } from "~/hooks/use-poe-categories"
import { MinMaxInput } from "./MinMaxInput"
import { POE2Query } from "~/lib/poe2-query-schema"
import { Path, useFormContext } from "react-hook-form"
import { SchemaFormField } from "./SchemaFormField"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { FormControl, FormField, FormItem } from "~/components/ui/form"
import { useState } from "react"
import { Collapsible, CollapsibleContent } from "~/components/ui/collapsible"

export const EquipmentFiltersSection = () => {
    const prefix: Path<POE2Query> = 'query.filters.equipment_filters.filters'
    const form = useFormContext<POE2Query>()
    const [isOpen, setIsOpen] = useState(true)

    return (
        <Card className="flex flex-col gap-0 bg-primary-foreground group">
            <CardHeader
                className="flex flex-col gap-2 m-0 p-1 px-2 pt-2 cursor-pointer hover:bg-muted/50 hover:rounded-xl transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <CardTitle className="flex gap-2">
                    <FormField
                        control={form.control}
                        name={'query.filters.equipment_filters.disabled'}
                        render={({ field }) => (
                            <FormItem onClick={(e) => e.stopPropagation()}>
                                <FormControl>
                                    <Checkbox
                                        id="equipment_filters"
                                        className="text-primary items-center"
                                        checked={!field.value}
                                        onCheckedChange={(checked) => {
                                            field.onChange(!checked);
                                        }}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Label className="text-[14px] cursor-pointer">Equipment filters</Label>
                </CardTitle>
            </CardHeader>
            <Collapsible open={isOpen} className="transition-all">
                <CollapsibleContent className="transition-all">
                    <CardContent className="p-0 pb-2 px-2">
                        <div className="grid grid-cols-2 gap-2">
                            <SchemaFormField
                                path={`${prefix}.damage`}
                                schemaType={'minMax'}
                                label={'Damage'}
                            />
                            <SchemaFormField
                                path={`${prefix}.aps`}
                                schemaType={'minMax'}
                                label="Attacks Per Second"
                            />
                            <SchemaFormField
                                path={`${prefix}.crit`}
                                schemaType={'minMax'}
                                label="Critical Chance"
                            />
                            <SchemaFormField
                                path={`${prefix}.dps`}
                                schemaType={'minMax'}
                                label="Damage Per Second (DPS)"
                            />
                            <SchemaFormField
                                path={`${prefix}.pdps`}
                                schemaType={'minMax'}
                                label="Physical DPS"
                            />
                            <SchemaFormField
                                path={`${prefix}.edps`}
                                schemaType={'minMax'}
                                label="Elemental DPS"
                            />
                            <SchemaFormField
                                path={`${prefix}.ar`}
                                schemaType={'minMax'}
                                label="Armour"
                            />
                            <SchemaFormField
                                path={`${prefix}.ev`}
                                schemaType={'minMax'}
                                label="Evasion"
                            />
                            <SchemaFormField
                                path={`${prefix}.es`}
                                schemaType={'minMax'}
                                label="Energy Shield"
                            />
                            <SchemaFormField
                                path={`${prefix}.block`}
                                schemaType={'minMax'}
                                label="Block"
                            />
                            <SchemaFormField
                                path={`${prefix}.spirit`}
                                schemaType={'minMax'}
                                label="Spirit"
                            />
                            <SchemaFormField
                                path={`${prefix}.rune_sockets`}
                                schemaType={'minMax'}
                                label="Rune Sockets"
                            />
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}