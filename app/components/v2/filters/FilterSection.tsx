import { SchemaFormField } from "./SchemaFormField"
import { FILTER_SECTIONS } from "~/lib/utils/schema-helpers"
import { getHook } from "~/hooks/use-poe-categories"

interface FilterSectionProps {
    sectionKey: keyof typeof FILTER_SECTIONS
}

export const FilterSection = ({ sectionKey }: FilterSectionProps) => {
    const section = FILTER_SECTIONS[sectionKey]

    if (!section?.fields?.length) {
        console.warn(`No fields found for section: ${sectionKey}`, section)
        return null
    }

    return (
        <div className="space-y-4">
            <h3 className="font-medium">{section.label}</h3>
            <div className="grid gap-2">
                {section.fields.map((field: any) => {
                    console.debug('Processing field:', { ...field })
                    const hook = field.optionsHook ? getHook(field.optionsHook) : undefined

                    if (field.optionsHook && !hook) {
                        console.warn(`No hook found for ${field.optionsHook}`)
                    }

                    const options = hook?.()?.data

                    return (
                        <SchemaFormField
                            key={field.path}
                            path={field.path}
                            schemaType={field.type}
                            label={field.label}
                            options={options}
                        />
                    )
                })}
            </div>
        </div>
    )
}
