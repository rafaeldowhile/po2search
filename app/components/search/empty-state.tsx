import { Button } from "~/components/ui/button";
import { ExternalLink, Filter, AlertCircle } from "lucide-react";
import { POE2_TRADE_URL } from "~/constants/search";

interface EmptyStateProps {
    searchId?: string;
    onOpenQueryEditor: () => void;
}

export function EmptyState({ searchId, onOpenQueryEditor }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex items-center justify-center w-16 h-16 bg-muted/30 rounded-full mb-6">
                <AlertCircle className="h-8 w-8 text-muted-foreground/70" />
            </div>

            <div className="max-w-[450px] text-center space-y-3 mb-8">
                <h3 className="text-xl font-semibold">
                    No items found
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    We couldn't find any items matching your search criteria. You can try:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 mt-2">
                    <li className="flex items-center gap-2 justify-center">
                        <Filter className="h-4 w-4" />
                        Adjusting your filters to broaden your search
                    </li>
                    <li className="flex items-center gap-2 justify-center">
                        <ExternalLink className="h-4 w-4" />
                        Continuing your search on Path of Exile Trade
                    </li>
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <Button
                    variant="default"
                    className="flex-1"
                    onClick={onOpenQueryEditor}
                >
                    <Filter className="mr-2 h-4 w-4" />
                    Adjust Filters
                </Button>
                {searchId && (
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`${POE2_TRADE_URL}/${searchId}`, '_blank')}
                    >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in PoE Trade
                    </Button>
                )}
            </div>

            {/* Quick Tips */}
            <div className="mt-8 w-full max-w-md">
                <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">Quick Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                        <li>• Try removing some stat filters</li>
                        <li>• Increase the min-max ranges</li>
                        <li>• Check if required stats are enabled</li>
                        <li>• Consider alternative item types</li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 