import { Path, useFormContext } from "react-hook-form"
import { POE2Query } from "~/lib/poe2-query-schema"
import { SchemaFormField } from "./SchemaFormField"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { FormControl, FormField, FormItem } from "~/components/ui/form"
import { Collapsible, CollapsibleContent } from "~/components/ui/collapsible"
import { useState } from "react"

export const RequirementFiltersSection = () => {
    const prefix: Path<POE2Query> = 'query.filters.req_filters.filters'
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
                        name={'query.filters.req_filters.disabled'}
                        render={({ field }) => (
                            <FormItem onClick={(e) => e.stopPropagation()}>
                                <FormControl>
                                    <Checkbox
                                        id="req_filters"
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
                    <Label className="text-[14px] cursor-pointer">Requirements filters</Label>
                </CardTitle>
            </CardHeader>
            <Collapsible open={isOpen} className="transition-all">
                <CollapsibleContent className="transition-all">
                    <CardContent className="p-0 pb-2 px-2">
                        <div className="grid grid-cols-2 gap-2">
                            <SchemaFormField
                                path={`${prefix}.lvl`}
                                schemaType={'minMax'}
                                label={'Level'}
                            />
                            <SchemaFormField
                                path={`${prefix}.str`}
                                schemaType={'minMax'}
                                label="Strength"
                            />
                            <SchemaFormField
                                path={`${prefix}.dex`}
                                schemaType={'minMax'}
                                label="Dexterity"
                            />
                            <SchemaFormField
                                path={`${prefix}.int`}
                                schemaType={'minMax'}
                                label="Intelligence"
                            />
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}