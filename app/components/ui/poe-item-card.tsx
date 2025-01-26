import { Copy } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { useToast } from "~/hooks/use-toast";
import exchangeData from "~/data/exchangeData.json";

interface PoEItemCardProps {
    item: any;
    listing: any;
}

// Helper function to get currency data
const getCurrencyData = (currencyId: string) => {
    return exchangeData.entries.find(entry => entry.id === currencyId);
};

export function PoEItemCard({ item, listing }: PoEItemCardProps) {
    const { toast } = useToast();
    const currencyData = getCurrencyData(listing.price.currency);

    const handleCopyWhisper = () => {
        navigator.clipboard.writeText(listing.whisper);
        toast({
            title: "Copied whisper",
            description: "Whisper message copied to clipboard",
        });
    };

    return (
        <div className="group relative bg-card hover:bg-accent/50 rounded-lg p-4 transition-colors">
            {/* Item Header */}
            <div className="flex items-start gap-3">
                <img src={item.icon} alt={item.name} className="w-12 h-12" />
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{item.typeLine}</p>
                    <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                            ilvl {item.ilvl}
                        </Badge>
                    </div>
                </div>
                {/* Move price to the right side */}
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
                        <span className="font-medium text-sm">
                            {listing.price.amount}
                        </span>
                        {currencyData && (
                            <div className="relative group/tooltip">
                                <img
                                    src={`https://www.pathofexile.com${currencyData.image}`}
                                    alt={currencyData.text}
                                    className="w-6 h-6"
                                />
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 
                                    bg-popover/90 text-popover-foreground text-xs rounded shadow-md
                                    opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap
                                    border border-border">
                                    {currencyData.text}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Properties and Mods */}
            <div className="mt-2 space-y-1">
                {/* Properties */}
                {item.properties?.map((prop: any, idx: number) => (
                    <div key={idx} className="text-xs flex justify-between text-muted-foreground">
                        <span>{prop.name}</span>
                        <span>{prop.values[0]?.[0] || "-"}</span>
                    </div>
                ))}

                {/* Divider if both properties and mods exist */}
                {item.properties?.length && item.explicitMods?.length ? (
                    <div className="border-t my-2" />
                ) : null}

                {/* Explicit Mods */}
                {item.explicitMods?.map((mod: string, idx: number) => (
                    <div key={idx} className="text-xs text-blue-500">{mod}</div>
                ))}
            </div>

            {/* Whisper Button - Only shows on hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleCopyWhisper}
                >
                    <Copy className="h-4 w-4" />
                </Button>
            </div>

            {/* Account - Shows on hover */}
            <div className="mt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {listing.account.name}
            </div>
        </div>
    );
} 