import { GameDescription } from "../constants";
import { Item } from "../searchv2";
import { InputData } from "../types";

export function parseBlightRavaged(inputData: InputData, item: Item) {
    const allowedClassId = ['map'];
    
    if (!allowedClassId.includes(item.header?.category ?? '')) {
        return false;
    }

    return item.header?.name?.toLowerCase().includes(GameDescription.blightRavaged.toLowerCase()) ?? false;
}
