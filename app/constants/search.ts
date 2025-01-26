export const RANGE_TYPES = {
    MIN_ONLY: "min_only",
    MAX_ONLY: "max_only",
    MINMAX: "minmax",
} as const;

export const POE2_TRADE_URL = "https://www.pathofexile.com/trade2/search/poe2/Standard";

export const DEFAULT_SEARCH_PARAMS = {
    input: "",
    rangeType: RANGE_TYPES.MIN_ONLY,
    enableStats: true,
    enabledFilterGroups: {
        type_filters: true,
        req_filters: true,
        equipment_filters: true,
        misc_filters: true,
    },
} as const;

export const MAX_HISTORY_ITEMS = 5; 