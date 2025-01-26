import { Copy } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { useToast } from "~/hooks/use-toast";
import exchangeData from "~/data/exchangeData.json";
import { Card } from "./card";
import { cn } from "~/lib/utils";

interface PoEItemCardProps {
    item: any;
    listing: any;
}

// Helper function to get currency data
const getCurrencyData = (currencyId: string) => {
    return exchangeData.entries.find(entry => entry.id === currencyId);
};

function Requirements({ requirements }: { requirements: any }) {
    if (!requirements) return null;

    const reqs = requirements.map((req: any) => {
        const [value] = req.values[0];
        switch (req.name) {
            case "Level":
                return `Level ${value}`;
            case "[Strength|Str]":
                return `${value} Str`;
            case "[Dexterity|Dex]":
                return `${value} Dex`;
            case "[Intelligence|Int]":
                return `${value} Int`;
            default:
                return null;
        }
    }).filter(Boolean);

    if (reqs.length === 0) return null;

    return (
        <div className="text-xs text-muted-foreground border-t border-border/50 mt-2 pt-2">
            <span className="text-foreground">Requirements:</span>{' '}
            {reqs.join(', ')}
        </div>
    );
}

function ItemStatus({ item }: { item: any }) {
    const statuses = [];

    if (item.corrupted) {
        statuses.push(
            <Badge
                variant="destructive"
                className="text-xs font-semibold bg-destructive/90 hover:bg-destructive/80"
            >
                Corrupted
            </Badge>
        );
    }
    if (item.mirrored) {
        statuses.push(<Badge variant="secondary" className="text-xs">Mirrored</Badge>);
    }
    if (item.identified === false) {
        statuses.push(<Badge variant="outline" className="text-xs">Unidentified</Badge>);
    }

    if (statuses.length === 0) return null;

    return (
        <div className="flex gap-1.5 flex-wrap mt-1">
            {statuses}
        </div>
    );
}

function GrantedSkills({ skills }: { skills: any[] }) {
    if (!skills?.length) return null;

    return (
        <div className="space-y-1 border-t border-border/50 pt-2">
            {skills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                    {skill.icon && (
                        <img src={skill.icon} alt="" className="w-4 h-4" />
                    )}
                    <span className="text-muted-foreground">
                        {skill.values?.[0]?.[0]}
                    </span>
                </div>
            ))}
        </div>
    );
}

function SocketedGems({ gems }: { gems?: any[] }) {
    if (!gems?.length) return null;

    return (
        <div className="space-y-1 border-t border-border/50 pt-2">
            <span className="text-xs text-muted-foreground">Socketed Gems:</span>
            <div className="space-y-1">
                {gems.map((gem, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                        {gem.icon && (
                            <img src={gem.icon} alt="" className="w-4 h-4" />
                        )}
                        <span className="text-muted-foreground">
                            {gem.typeLine} {gem.level > 1 && `(Level ${gem.level})`}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Sockets({ sockets }: { sockets?: { group: number; sColor: string }[] }) {
    if (!sockets?.length) return null;

    // Group sockets by their link groups
    const socketGroups = sockets.reduce((acc, socket) => {
        if (!acc[socket.group]) {
            acc[socket.group] = [];
        }
        acc[socket.group].push(socket);
        return acc;
    }, {} as Record<number, typeof sockets>);

    return (
        <div className="space-y-1 border-t border-border/50 pt-2">
            <span className="text-xs text-muted-foreground">Sockets:</span>
            <div className="flex gap-1.5">
                {Object.values(socketGroups).map((group, groupIndex) => (
                    <div key={groupIndex} className="flex items-center">
                        {group.map((socket, socketIndex) => (
                            <div key={socketIndex} className="flex items-center">
                                <div className={cn(
                                    "w-3 h-3 rounded-full border flex items-center justify-center text-[10px]",
                                    socket.sColor === "R" && "border-red-400 text-red-400",
                                    socket.sColor === "G" && "border-green-400 text-green-400",
                                    socket.sColor === "B" && "border-blue-400 text-blue-400",
                                    socket.sColor === "W" && "border-white text-white",
                                    socket.sColor === "A" && "border-purple-400 text-purple-400",
                                )}>
                                    {socket.sColor}
                                </div>
                                {socketIndex < group.length - 1 && (
                                    <div className="w-1 h-px bg-border mx-0.5" />
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function PoEItemCard({ item, listing }: PoEItemCardProps) {
    const { toast } = useToast();
    const currencyData = getCurrencyData(listing.price.currency);

    const cardClassName = cn(
        "overflow-hidden",
        item.corrupted && "border-t-2 border-t-destructive"
    );

    const handleCopyWhisper = () => {
        navigator.clipboard.writeText(listing.whisper);
        toast({
            title: "Copied whisper",
            description: "Whisper message copied to clipboard",
        });
    };

    const rarity = item.frameType;
    const rarityClass = {
        0: 'text-normal',  // Normal
        1: 'text-magic',   // Magic
        2: 'text-rare',    // Rare
        3: 'text-unique',  // Unique
        9: 'text-relic'    // Relic
    }[rarity] || 'text-normal';

    return (
        <Card className={cardClassName}>
            <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={item.icon} alt={item.name} className="w-12 h-12" />
                    </div>
                    {/* Price */}
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

                {/* Item Details */}
                <div className="space-y-1">
                    <div className={cn("font-semibold", rarityClass)}>
                        {item.name || item.baseType}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        {item.baseType}
                        <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-xs">
                                iLvl {item.ilvl}
                            </Badge>
                            {item.requirements?.find(req => req.name === "Level") && (
                                <Badge variant="secondary" className="text-xs">
                                    LVL {item.requirements.find(req => req.name === "Level").values[0][0]}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <ItemStatus item={item} />
                    <Sockets sockets={item.sockets} />
                    <SocketedGems gems={item.socketedItems} />
                    <Requirements
                        requirements={item.requirements?.filter(req => req.name !== "Level")}
                    />
                    <GrantedSkills skills={item.grantedSkills} />
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
                    {(item.properties?.length || item.grantedSkills?.length) && item.explicitMods?.length ? (
                        <div className="border-t my-2" />
                    ) : null}

                    {/* Explicit Mods */}
                    {item.explicitMods?.map((mod: string, idx: number) => (
                        <div key={idx} className="text-xs text-blue-500">{mod}</div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center flex-col justify-between pt-2 border-t gap-2">
                    <span className="text-xs text-muted-foreground">
                        {listing.account.name}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyWhisper}
                        className="h-7 text-xs"
                    >
                        <Copy className="h-3 w-3 mr-2" />
                        Copy Whisper
                    </Button>
                </div>
            </div>
        </Card>
    );
} 