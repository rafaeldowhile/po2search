import { useQuery } from "@tanstack/react-query";
import items from "../data/items.json";

export const usePoeItems = () => {
    return useQuery({
        queryKey: ["poe-items"],
        queryFn: () => items,
        staleTime: Infinity,
    });
};
