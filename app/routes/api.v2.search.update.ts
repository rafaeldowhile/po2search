import { ActionFunctionArgs } from "@remix-run/node";
import chunk from "lodash/chunk";
import { POE2Query } from "~/lib/poe2-query-schema";
import POE2TradeAPI from "~/lib/poe2api";
import { QueryOptions, QueryRealm } from "~/lib/types";
import { cleanQuery } from "~/lib/utils/query-helpers";

export async function action({ request }: ActionFunctionArgs) {
    const { query: dirtyQuery, options }: { query: POE2Query; options: QueryOptions } = await request.json();
    try {
        const poe2query = cleanQuery(dirtyQuery);
        const api = new POE2TradeAPI();
        // console.log(JSON.stringify(poe2query, null, 2));
        
        const { id, complexity, result, total } = await api.search(poe2query, options.league);

        if (result.length === 0) {
            return {
                query: poe2query,
                data: {
                    id,
                    total,
                    complexity,
                    results: []
                }
            }
        }

        const batches = chunk(result, 10);
        const allItems = await Promise.all(batches.map(async (batch) => {
            const items = await api.fetch(batch, id, QueryRealm.poe2);
            return items;
        }));

        return {
            query: poe2query,
            data: {
                id,
                total,
                complexity,
                results: allItems.map(result => result.result).flat()
            }

        }

    } catch (e: any) {
        console.error(e);
        return Response.json({ message: e.message }, { status: 400 });
    }

}