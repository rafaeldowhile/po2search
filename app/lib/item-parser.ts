const ITEM_SEPARATOR = '--------';

function itemToLines(input: string) {
    return input.split('\n').filter(line => line !== ITEM_SEPARATOR);
}

function parseItem(input: string) {
    const lines = itemToLines(input);
    return lines;
}