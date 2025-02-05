import { Path } from "react-hook-form"
import { z } from "zod"
import { equipmentFiltersAttributes, misFiltersAttributes, POE2Query, reqFiltersAttributes, typeFiltersAttributes } from "~/lib/poe2-query-schema"

type SchemaField = {
    type: 'minMax' | 'option'
    label: string
    path: Path<POE2Query>
    optionsHook?: string
}

type SchemaSection = {
    fields: any[]
    label: string
}

export const parseZodSchema = (schema: z.ZodObject<any>, basePath: string): SchemaField[] => {
    const fields: SchemaField[] = []
    
    Object.entries(schema.shape).forEach(([key, value]) => {
        const path = `${basePath}.${key}` as Path<POE2Query>
        
        if (value instanceof z.ZodObject) {
            if ('min' in value.shape && 'max' in value.shape) {
                fields.push({
                    type: 'minMax',
                    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                    path
                })
            }
            else if ('option' in value.shape) {
                const hookName = `usePoe${key.charAt(0).toUpperCase() + key.slice(1)}`
                fields.push({
                    type: 'option',
                    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                    path,
                    optionsHook: hookName
                })
            }
        }
    })
    
    return fields
}

export const FILTER_SECTIONS: Record<string, any> = {
    type_filters: {
        label: 'Type Filters',
        fields: typeFiltersAttributes.default
    },
    // equipment_filters: {
    //     label: 'Equipment Filters',
    //     fields: parseZodSchema(equipmentFiltersAttributes, 'query.filters.equipment_filters.filters')
    // },
    // req_filters: {
    //     label: 'Requirements',
    //     fields: parseZodSchema(reqFiltersAttributes, 'query.filters.req_filters.filters')
    // },
    // misc_filters: {
    //     label: 'Miscellaneous',
    //     fields: parseZodSchema(misFiltersAttributes, 'query.filters.misc_filters.filters')
    // }
}
