import { ActionFunctionArgs } from "@remix-run/node";
import chunk from "lodash/chunk";
import POE2TradeAPI from "~/lib/poe2api";
import { getPoeQuery, inputToItem } from "~/lib/searchv2";
import { QueryOptions, QueryRealm } from "~/lib/types";

export async function action({ request }: ActionFunctionArgs) {
    const { input, options }: { input: string; options: QueryOptions } = await request.json();
    // return mockResponse;
    try {

        const item = await inputToItem(input);
        const poe2query = getPoeQuery(item, options);
        const api = new POE2TradeAPI();
        console.log(item);
        console.log(poe2query);
        const { id, complexity, result, total } = await api.search(poe2query, options.league);

        if (result.length === 0) {
            return {
                item: item,
                query: poe2query,
                data: {
                    id,
                    complexity,
                    total,
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
            item: item,
            query: poe2query,
            data: {
                id,
                total,
                complexity,
                results: allItems.map(result => result.result).flat()
            }

        }

    } catch (e: any) {
        return Response.json({ message: e.message }, { status: 400 });
    }

}