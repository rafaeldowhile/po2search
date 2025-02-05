import { Path, useFormContext } from "react-hook-form"
import { POE2Query } from "~/lib/poe2-query-schema"
import { SchemaFormField } from "./SchemaFormField"
import { usePoeBooleanOptions } from "~/hooks/use-poe-categories"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { FormControl, FormField, FormItem } from "~/components/ui/form"
import { useState } from "react"
import { Collapsible, CollapsibleContent } from "~/components/ui/collapsible"

export const MiscFiltersSection = () => {
    const prefix: Path<POE2Query> = 'query.filters.misc_filters.filters'
    const { data: poeBooleanOptions } = usePoeBooleanOptions()
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
                        name={'query.filters.misc_filters.disabled'}
                        render={({ field }) => (
                            <FormItem onClick={(e) => e.stopPropagation()}>
                                <FormControl>
                                    <Checkbox
                                        id="misc_filters"
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
                    <Label className="text-[14px] cursor-pointer">Misc filters</Label>
                </CardTitle>
            </CardHeader>
            <Collapsible open={isOpen} className="transition-all">
                <CollapsibleContent className="transition-all">
                    <CardContent className="p-0 pb-2 px-2">
                        <div className="grid grid-cols-2 gap-2">
                            <SchemaFormField
                                path={`${prefix}.gem_level`}
                                schemaType={'minMax'}
                                label={'Gem Level'}
                            />
                            <SchemaFormField
                                path={`${prefix}.gem_sockets`}
                                schemaType={'minMax'}
                                label="Gem Sockets"
                            />
                            <SchemaFormField
                                path={`${prefix}.area_level`}
                                schemaType={'minMax'}
                                label="Area Level"
                            />
                            <SchemaFormField
                                path={`${prefix}.stack_size`}
                                schemaType={'minMax'}
                                label="Stack Size"
                            />
                            <SchemaFormField
                                path={`${prefix}.identified`}
                                schemaType={'option'}
                                label="Identified"
                                options={poeBooleanOptions}
                            />
                            <SchemaFormField
                                path={`${prefix}.corrupted`}
                                schemaType={'option'}
                                label="Corrupted"
                                options={poeBooleanOptions}
                            />
                            <SchemaFormField
                                path={`${prefix}.mirrored`}
                                schemaType={'option'}
                                label="Mirrored"
                                options={poeBooleanOptions}
                            />
                            <SchemaFormField
                                path={`${prefix}.alternate_art`}
                                schemaType={'option'}
                                label="Alternate Art"
                                options={poeBooleanOptions}
                            />
                            <SchemaFormField
                                path={`${prefix}.sanctum_gold`}
                                schemaType={'option'}
                                label="Barya Sacred Water"
                                options={poeBooleanOptions}
                            />
                            <SchemaFormField
                                path={`${prefix}.unidentified_tier`}
                                schemaType={'option'}
                                label="Unidentified Tier"
                                options={poeBooleanOptions}
                            />
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}