import { GameDescription } from "../constants";
import { Item } from "../models/item";
import { InputData } from "../types";

export function parseBlighted(inputData: InputData, item: Item) {
    const allowedClassId = ['map'];

    if (!allowedClassId.includes(item.header?.category ?? '')) {
        return false;
    }

    return item.header?.name?.toLowerCase().includes(GameDescription.blighted.toLowerCase()) ?? false;
}