import { useQuery } from "@tanstack/react-query"
import stats from "~/data/stats.json";

export function useStatsFlat() {
    return useQuery({
        queryKey: ["stats-flat"],
        queryFn: async () => {
            const allStats = stats.result.reduce((acc, group) => {
                group.entries.forEach(entry => {
                    acc[entry.id] = {
                        text: entry.text,
                        type: entry.type
                    };
                });
                return acc;
            }, {} as Record<string, { text: string, type: string }>);

            return allStats;
        }
    });
}

export function useStats() {
    return useQuery({
        queryKey: ["stats"],
        queryFn: async () => {
            return stats.result
        }
    })
}