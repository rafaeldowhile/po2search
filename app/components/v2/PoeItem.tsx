import { ArrowDownIcon, ArrowUpIcon, Copy, Gem, ChevronRight } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { removeSquareBrackets } from "~/lib/helpers";
import { buildMods, compareValues, getCurrencyData } from "~/lib/item-utils";
import { POE2Query } from "~/lib/poe2-query-schema";
import { PoeItemResponse, ModInfo, ItemProperty, Socket, RequirementType, GrantedSkill, SocketedGem } from "~/lib/types";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface PoeItemProps {
    item: PoeItemResponse;
    query?: POE2Query;
}

const ItemHeader = ({ item }: { item: PoeItemResponse['item'] }) => {
    const rarity = item.frameType;
    const rarityClass = {
        0: 'text-normal',  // Normal
        1: 'text-magic',   // Magic
        2: 'text-rare',    // Rare
        3: 'text-unique',  // Unique
        9: 'text-relic'    // Relic
    }[rarity] || 'text-normal';

    return (
        <div className="flex items-center gap-3">
            <img src={item.icon} alt={item.name} className="w-12 h-12" />
            <div className="space-y-1">
                <div className={cn("font-semibold", rarityClass)}>
                    {item.name || item.baseType}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {item.baseType}
                    <Badge variant="outline" className="text-xs">
                        iLvl {item.ilvl}
                    </Badge>
                </div>
            </div>
        </div>
    );
};

const ItemPrice = ({ listing }: { listing: PoeItemResponse['listing'] }) => {
    const currencyData = getCurrencyData(listing.price.currency);
    
    return (
        <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
            <span className="font-medium text-sm">
                {listing.price.amount}
            </span>
            {currencyData && (
                <div className="relative group">
                    <img
                        src={`https://www.pathofexile.com${currencyData.image}`}
                        alt={currencyData.text}
                        className="w-6 h-6"
                    />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 
                        bg-popover/90 text-popover-foreground text-xs rounded shadow-md
                        opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap
                        border border-border">
                        {currencyData.text}
                    </span>
                </div>
            )}
        </div>
    );
};

const ItemStatus = ({ item }: { item: PoeItemResponse['item'] }) => {
    const statuses = [];

    if (item.corrupted) {
        statuses.push(
            <Badge
                key="corrupted"
                variant="destructive"
                className="text-[9px] font-semibold bg-destructive/90 hover:bg-destructive/80 px-0.5 py-0.5"
            >
                Corrupted
            </Badge>
        );
    }
    if (item.mirrored) {
        statuses.push(
            <Badge 
                key="mirrored"
                variant="secondary" 
                className="text-xs"
            >
                Mirrored
            </Badge>
        );
    }
    if (!item.identified) {
        statuses.push(
            <Badge 
                key="unidentified"
                variant="outline" 
                className="text-xs"
            >
                Unidentified
            </Badge>
        );
    }

    if (statuses.length === 0) return null;

    return (
        <div className="flex gap-1.5 flex-wrap mt-1">
            {statuses}
        </div>
    );
};

const Requirements = ({ requirements }: { requirements?: RequirementType[] }) => {
    if (!requirements?.length) return null;

    const levelReq = requirements.find(req => removeSquareBrackets(req.name) === 'Level');
    const attrReqs = requirements.filter(req => removeSquareBrackets(req.name) !== 'Level');

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {levelReq && (
                <Badge variant="secondary" className="text-xs">
                    Level {levelReq.values[0][0]}
                </Badge>
            )}
            {attrReqs.map(req => (
                <Badge 
                    key={req.name}
                    variant="outline" 
                    className="text-xs"
                >
                    {removeSquareBrackets(req.name)} {req.values[0][0]}
                </Badge>
            ))}
        </div>
    );
};

const GrantedSkills = ({ item }: { item: { grantedSkills?: GrantedSkill[] }}) => {
    if (!item.grantedSkills?.length) return null;

    return (
        <div className="space-y-1.5 border-t border-border/50 pt-2">
            <div className="text-xs font-medium text-muted-foreground">
                Granted Skills
            </div>
            {item.grantedSkills.map((skill, idx) => (
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
};

const SocketDisplay = ({ item }: { item: { sockets?: Socket[], socketedItems?: SocketedGem[] }}) => {
    if (!item.sockets?.length) return null;

    const totalSockets = item.sockets.length;
    const socketedGems = item.socketedItems || [];
    const runeCount = socketedGems.filter(gem => gem.typeLine.includes('Rune')).length;
    const gemCount = socketedGems.filter(gem => !gem.typeLine.includes('Rune')).length;

    const getSocketColor = (type: 'rune' | 'gem' | string) => {
        return type === 'rune' ? 'border-amber-400 text-amber-400' : 'border-blue-400 text-blue-400';
    };

    return (
        <div className="space-y-1.5 border-t border-border/50 pt-2">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                    Sockets ({socketedGems.length}/{totalSockets} used)
                </span>
                {socketedGems.length > 0 && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 text-xs">
                                <Gem className="h-3 w-3 mr-1.5" />
                                View socketed items
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2">
                            <div className="space-y-2">
                                {socketedGems.map((gem, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                        {gem.icon && (
                                            <img src={gem.icon} alt="" className="w-5 h-5" />
                                        )}
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "font-medium",
                                                gem.typeLine.includes('Rune') ? "text-amber-400" : "text-blue-400"
                                            )}>
                                                {gem.typeLine}
                                            </span>
                                            {gem.properties?.find(p => p.name === "Level")?.values[0][0] > 1 && (
                                                <span className="text-muted-foreground text-[10px]">
                                                    Level {gem.properties?.find(p => p.name === "Level")?.values[0][0]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
            <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    {item.sockets.map((socket, idx) => (
                        <div key={idx} className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] font-medium",
                            getSocketColor(socket.type)
                        )}>
                            {socket.type === 'rune' ? 'R' : 'G'}
                        </div>
                    ))}
                </div>
                {(runeCount > 0 || gemCount > 0) && (
                    <span className="text-xs text-muted-foreground">
                        {[
                            runeCount > 0 && `${runeCount} ${runeCount === 1 ? 'Rune' : 'Runes'}`,
                            gemCount > 0 && `${gemCount} ${gemCount === 1 ? 'Gem' : 'Gems'}`
                        ].filter(Boolean).join(', ')}
                    </span>
                )}
            </div>
        </div>
    );
};

const ModValueComparison = ({ diff, type }: { diff: number; type: 'higher' | 'lower' }) => {
    return (
        <div className={cn(
            "flex items-center gap-0.5 text-xs",
            type === 'higher' ? "text-green-500" : "text-red-500"
        )}>
            {type === 'higher' ? (
                <>
                    <ArrowUpIcon className="h-3 w-3" />
                    <span>+{diff}%</span>
                </>
            ) : (
                <>
                    <ArrowDownIcon className="h-3 w-3" />
                    <span>-{diff}%</span>
                </>
            )}
        </div>
    );
};

const ItemMods = ({ item, query }: { 
    item: PoeItemResponse['item'];
    query?: POE2Query;
}) => {
    const renderModSection = (
        title: string,
        mods: ReturnType<typeof buildMods>, 
        type: 'implicit' | 'explicit' | 'enchant' | 'rune'
    ) => {
        if (!mods?.length) return null;

        const colorClasses = {
            implicit: 'text-green-500',
            explicit: 'text-blue-400',
            enchant: 'text-purple-400',
            rune: 'text-amber-400'
        };

        return (
            <div className="space-y-0.5">
                <div className="text-[12px] text-muted-foreground">{title}</div>
                {mods.map((mod, idx) => {
                    if (!mod) return null;
                    const comparison = mod.matched && mod.matchingFilter ? 
                        compareValues(mod.text, mod.matchingFilter) : null;
                    
                    const tooltipContent = mod.matched ? 
                        `Search criteria: ${mod.matchingFilter?.value?.min ?? ''} ${mod.matchingFilter?.value?.max ? `- ${mod.matchingFilter.value.max}` : ''}` : null;
                    
                    return (
                        <div key={idx} className="group relative">
                            <div className="flex items-center gap-2 cursor-help">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                    mod.matched ? "bg-green-500" : "bg-border"
                                )} />
                                <div className={cn(
                                    "text-[12px] flex items-center justify-between flex-1",
                                    colorClasses[type],
                                    mod.matched && "font-medium"
                                )}>
                                    {mod.text}
                                    {comparison && (
                                        <ModValueComparison 
                                            diff={comparison.diff} 
                                            type={comparison.type as 'higher' | 'lower'} 
                                        />
                                    )}
                                </div>
                            </div>
                            {tooltipContent && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 
                                    bg-popover text-popover-foreground text-xs rounded shadow-md
                                    opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap
                                    pointer-events-none border border-border">
                                    {tooltipContent}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-3 border-t border-border/50 pt-2">
            {renderModSection('Enchant Mods', buildMods(item, 'enchant', query), 'enchant')}
            {renderModSection('Implicit Mods', buildMods(item, 'implicit', query), 'implicit')}
            {renderModSection('Explicit Mods', buildMods(item, 'explicit', query), 'explicit')}
            {renderModSection('Rune Effects', buildMods(item, 'rune', query), 'rune')}
        </div>
    );
};

const ItemProperties = ({ item }: { item: { properties?: ItemProperty[] }}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!item.properties?.length) return null;

    // Extract quality and remaining properties
    const category = item.properties[0];
    const quality = item.properties.find(prop => removeSquareBrackets(prop.name) === 'Quality');
    const otherProperties = item.properties
        .slice(1)
        .filter(prop => removeSquareBrackets(prop.name) !== 'Quality');

    return (
        <div className="space-y-1.5 border-t border-border/50 pt-2">
            <div className="flex items-center justify-between mb-1">
                {category && (
                    <span className="text-xs text-muted-foreground">
                        {removeSquareBrackets(category.name)}
                    </span>
                )}
                {quality && (
                    <Badge variant="secondary" className="text-xs">
                        Quality: {quality.values[0][0]}
                    </Badge>
                )}
            </div>
            
            {otherProperties.length > 0 && (
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center gap-2 group hover:bg-secondary/50 rounded px-1"
                >
                    <ChevronRight className={cn(
                        "h-3 w-3 text-muted-foreground transition-transform",
                        isExpanded && "rotate-90"
                    )} />
                    <div className="text-xs text-muted-foreground flex items-center justify-between flex-1">
                        <span>Properties</span>
                        <span className="text-[10px] text-muted-foreground/70 group-hover:text-muted-foreground">
                            {isExpanded ? "Click to collapse" : "Click to expand"}
                        </span>
                    </div>
                </button>
            )}
            
            {isExpanded && otherProperties.length > 0 && (
                <div className="grid grid-cols-2 gap-1 pt-1">
                    {otherProperties.map((prop, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="underline">{removeSquareBrackets(prop.name)}</span>
                            <span className="font-medium">
                                {prop.values[0]?.[0] || "-"}
                                {prop.type === 15 && "%"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ItemExtendedProperties = ({ extended }: { extended?: PoeItemResponse['item']['extended'] }) => {
    if (!extended) return null;

    const propertyMap = {
        pdps: { label: 'Physical DPS', aug: 'pdps_aug' },
        edps: { label: 'Elemental DPS', aug: 'edps_aug' },
        dps: { label: 'Total DPS', aug: 'dps_aug' },
        aps: { label: 'Attack Speed', aug: 'aps_aug' },
        crit: { label: 'Crit Chance', aug: 'crit_aug', format: (v: number) => v.toFixed(2) + '%' },
        block: { label: 'Block', aug: 'block_aug', format: (v: number) => v + '%' },
        ar: { label: 'Armour', aug: 'ar_aug' },
        ev: { label: 'Evasion', aug: 'ev_aug' },
        es: { label: 'Energy Shield', aug: 'es_aug' },
        spirit: { label: 'Spirit', aug: 'spirit_aug' }
    } as const;

    const properties = Object.entries(propertyMap)
        .filter(([key]) => extended[key as keyof typeof propertyMap] !== undefined)
        .map(([key, config]) => {
            const value = extended[key as keyof typeof propertyMap] as number;
            const isAugmented = extended[config.aug as keyof typeof extended];
            const formattedValue = config.format ? config.format(value) : Math.round(value).toString();

            return {
                label: config.label,
                value: formattedValue,
                isAugmented
            };
        });

    if (properties.length === 0) return null;

    return (
        <div className="space-y-1.5 border-t border-border/50 pt-2">
            <div className="text-xs font-medium text-muted-foreground">Extended Properties</div>
            <div className="grid grid-cols-2 gap-1">
                {properties.map((prop, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{prop.label}</span>
                        <span className={cn(
                            prop.isAugmented && "text-blue-400 font-medium"
                        )}>
                            {prop.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ListingInfo = ({ listing }: { listing: PoeItemResponse['listing'] }) => {
    const { toast } = useToast();
    
    const handleCopyWhisper = () => {
        navigator.clipboard.writeText(listing.whisper);
        toast({
            title: "Copied whisper",
            description: "Whisper message copied to clipboard",
        });
    };

    return (
        <div className="flex items-center justify-between border-t border-border/50 pt-2 mt-2">
            <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">
                    {listing.account.name}
                </span>
                <span className="text-[10px] text-muted-foreground/80">
                    Listed {formatDistanceToNow(new Date(listing.indexed))} ago
                </span>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyWhisper}
                className="h-7 text-xs"
            >
                <Copy className="h-3 w-3 mr-2" />
                Whisper
            </Button>
        </div>
    );
};

export const PoeItem = ({ item, query }: PoeItemProps) => {
    const cardClassName = cn(
        "overflow-hidden",
        item.item.corrupted && "border-t-2 border-t-destructive"
    );

    return (
        <Card className={cardClassName}>
            <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <ItemHeader item={item.item} />
                    <ItemPrice listing={item.listing} />
                </div>
                <Requirements requirements={item.item.requirements} />
                <ItemStatus item={item.item} />
                <ItemProperties item={item.item} />
                <ItemExtendedProperties extended={item.item.extended} />
                <SocketDisplay item={item.item} />
                <GrantedSkills item={item.item} />
                <ItemMods item={item.item} query={query}/>
                <ListingInfo listing={item.listing} />
            </div>
        </Card>
    );
};