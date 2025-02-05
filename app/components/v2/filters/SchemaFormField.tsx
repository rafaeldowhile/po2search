import { Path } from "react-hook-form"
import { POE2Query } from "~/lib/poe2-query-schema"
import { MinMaxInput } from "./MinMaxInput"
import { SelectField } from "./SelectField"


interface SchemaFormFieldProps {
    path: Path<POE2Query>
    schemaType: 'minMax' | 'option'
    label: string
    options?: any[]
}

export const SchemaFormField = ({ path, schemaType, label, options }: SchemaFormFieldProps) => {
    switch (schemaType) {
        case 'minMax':
            return (
                <MinMaxInput
                    label={label}
                    path={path}
                />
            )
        case 'option':
            if (!options) return null
            return (
                <SelectField
                    name={path as Path<POE2Query>}
                    label={label}
                    options={options}
                    optionLabel="text"
                    optionValue="id"
                />
            )
        default:
            return null
    }
}
