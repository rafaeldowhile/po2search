import { Info } from "lucide-react";

export function SearchGuide() {
    return (
        <div className="rounded-lg border bg-card p-4 text-card-foreground">
            <div className="flex items-center gap-2 mb-3">
                <Info className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">How to Search for Items</h3>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
                <p>Follow these steps to search for items:</p>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Launch Path of Exile</li>
                    <li>Open your inventory or stash tab</li>
                    <li>Hover your mouse over the item you want to search for</li>
                    <li>Press <kbd className="px-1.5 py-0.5 text-xs rounded border bg-muted">Ctrl+C</kbd> (or <kbd className="px-1.5 py-0.5 text-xs rounded border bg-muted">⌘+C</kbd> on Mac) to copy the item data</li>
                    <li>Paste the copied data into the search box above</li>
                    <li>Click Search or press <kbd className="px-1.5 py-0.5 text-xs rounded border bg-muted">Ctrl+Enter</kbd> to find similar items</li>
                </ol>
            </div>
        </div>
    );
} 