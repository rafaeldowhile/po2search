import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Label } from "~/components/ui/label";
import { StatsFilter as StatFilters } from "~/lib/poe2-query-schema";
import { StatInputRange } from "./StatInputRange";

interface FormStatFiltersProps {
    stats: StatFilters[];
    form: any;
}

export const FormStatFilters = ({ stats, form }: FormStatFiltersProps) => {
    return (
        <section className="space-y-2.5">
            <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center gap-1.5 w-full">
                    <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 [&[data-state=open]>svg]:rotate-180" />
                    <h3 className="font-medium text-xs">Stats</h3>
                    <div className="h-px flex-1 bg-border" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1.5">
                    <div className="space-y-1.5">
                        {stats?.map((stat, groupIndex) => {
                            return (
                                <div 
                                    key={groupIndex} 
                                    className={`flex flex-col gap-2 p-2 ${
                                        groupIndex === 1 ? 'bg-yellow-500/10 rounded-md' : ''
                                    }`}
                                >
                                    {stat?.filters?.map((filter, index) => (
                                        <StatInputRange
                                            key={`${groupIndex}-${index}`}
                                            groupIndex={groupIndex}
                                            index={index}
                                            filter={filter}
                                            form={form.control}
                                        />
                                    ))}
                                    {groupIndex === 1 && (
                                        <div className="text-yellow-500 text-xs italic">
                                            PoE2 has multiple mods with identical names. These stats help narrow down the search to find exact matches.
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </section>
    )
}
