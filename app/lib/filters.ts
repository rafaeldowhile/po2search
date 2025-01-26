import type { FilterItem, TypeFilters } from "~/types/search";
import equipmentFilters from "~/data/equipment_filters.json";
import reqFilters from "~/data/req_filters.json";
import typeFilters from "~/data/type_filters.json";
import miscFilters from "~/data/misc_filters.json";

export const getFilterName = (groupKey: string, filterId: string): string => {
    switch (groupKey) {
        case "equipment_filters":
            return (equipmentFilters as FilterItem[]).find(f => f.id === filterId)?.text || filterId.replace(/_/g, ' ');
        case "req_filters":
            return (reqFilters as FilterItem[]).find(f => f.id === filterId)?.text || filterId.replace(/_/g, ' ');
        case "type_filters":
            return (typeFilters as TypeFilters).filters.find(f => f.id === filterId)?.text || filterId.replace(/_/g, ' ');
        case "misc_filters":
            return (miscFilters as FilterItem[]).find(f => f.id === filterId)?.text || filterId.replace(/_/g, ' ');
        default:
            return filterId.replace(/_/g, ' ');
    }
};

export const getGroupDisplayName = (groupKey: string): string => {
    switch (groupKey) {
        case "equipment_filters":
            return "Equipment";
        case "req_filters":
            return "Requirements";
        case "type_filters":
            return "Type";
        case "misc_filters":
            return "Miscellaneous";
        default:
            return groupKey.split('_')[0].charAt(0).toUpperCase() + groupKey.split('_')[0].slice(1);
    }
}; 