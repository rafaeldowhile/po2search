// item-parser.ts

// Basic interfaces
interface Item {
  header: ItemHeader;
  properties: ItemProperties;
  sockets: Socket[];
  modifierLines: ModifierLine[];
  pseudoModifiers: PseudoModifier[];
  text: string;
  additionalInformation?: any;
}

interface ItemHeader {
  category: Category;
  rarity: Rarity;
  name?: string;
  type?: string;
  itemCategory?: string;
  apiName?: string; 
  apiType?: string;
  apiItemId?: string;
}

interface ItemProperties {
  quality?: number;
  armour?: number;
  evasion?: number;
  energyShield?: number;
  blockChance?: number;
  attacksPerSecond?: number;
  criticalHitChance?: number;
  physicalDamage?: {min: number, max: number};
  elementalDamage?: Array<{min: number, max: number, type: string}>;
}

interface Socket {
  group: number;
  color: SocketColor;
}

interface ModifierLine {
  text: string;
  type: ModifierType;
}

interface PseudoModifier {
  text: string;
  value: number;
}

// Enums
enum Category {
  Weapon = "weapon",
  Armour = "armour",
  Accessory = "accessory",
  Gem = "gem",
  Currency = "currency",
  Unknown = "unknown"
}

enum Rarity {
  Normal = "Normal",
  Magic = "Magic",
  Rare = "Rare",
  Unique = "Unique",
  Currency = "Currency",
  Gem = "Gem"
}

enum SocketColor {
  Red = "R",
  Green = "G",
  Blue = "B",
  White = "W",
  Abyss = "A"
}

enum ModifierType {
  Implicit = "implicit",
  Explicit = "explicit",
  Crafted = "crafted",
  Enchant = "enchant",
  Scourge = "scourge"
}

// Helper class for parsing blocks of text
class ParsingBlock {
  private lines: string[];
  
  constructor(text: string) {
    this.lines = text.split("\n").filter(line => line.trim().length > 0);
  }

  public getLines(): string[] {
    return this.lines;
  }
}

// Main parser class
export class ItemParser {
  public parseItem(itemText: string): Item {
    if (!itemText) {
      throw new Error("Cannot parse empty item text");
    }

    try {
      const blocks = itemText.split("--------").map(block => new ParsingBlock(block));
      
      const header = this.parseHeader(blocks[0]);
      const properties = this.parseProperties(blocks);
      const sockets = this.parseSockets(blocks);
      const modifiers = this.parseModifiers(blocks);
      const pseudoMods = this.parsePseudoModifiers(modifiers);

      return {
        header,
        properties,
        sockets,
        modifierLines: modifiers,
        pseudoModifiers: pseudoMods,
        text: itemText
      };
    } catch (error) {
      console.error("Failed to parse item:", error);
      throw error;
    }
  }

  private parseHeader(block: ParsingBlock): ItemHeader {
    const lines = block.getLines();
    const itemClass = lines[0].replace("Item Class: ", "");
    const rarity = lines[1].replace("Rarity: ", "") as Rarity;
    
    return {
      category: this.getCategoryFromItemClass(itemClass),
      rarity,
      name: lines.length > 3 ? lines[2] : undefined,
      type: lines.length > 3 ? lines[3] : lines[2],
      itemCategory: itemClass
    };
  }

  private parseProperties(blocks: ParsingBlock[]): ItemProperties {
    const props: ItemProperties = {};
    
    // Find properties block (usually block 1 or 2)
    const propertyBlock = blocks.find(block => 
      block.getLines().some(line => 
        line.includes("Physical Damage:") || 
        line.includes("Quality:") ||
        line.includes("Armour:"))
    );

    if (!propertyBlock) return props;

    propertyBlock.getLines().forEach(line => {
      if (line.includes("Physical Damage:")) {
        const [min, max] = line.split(":")[1].trim().split("-").map(Number);
        props.physicalDamage = { min, max };
      }
      if (line.includes("Critical Strike Chance:")) {
        props.criticalHitChance = parseFloat(line.split(":")[1].trim());
      }
      if (line.includes("Attacks per Second:")) {
        props.attacksPerSecond = parseFloat(line.split(":")[1].trim());
      }
    });

    return props;
  }

  private parseSockets(blocks: ParsingBlock[]): Socket[] {
    const sockets: Socket[] = [];
    const socketBlock = blocks.find(block => 
      block.getLines().some(line => line.includes("Sockets:"))
    );

    if (!socketBlock) return sockets;

    const socketLine = socketBlock.getLines()[0];
    const socketGroups = socketLine.split(":")[1].trim().split(" ");
    
    socketGroups.forEach((group, groupIndex) => {
      group.split("").forEach(color => {
        sockets.push({
          group: groupIndex,
          color: color as SocketColor
        });
      });
    });

    return sockets;
  }

  private parseModifiers(blocks: ParsingBlock[]): ModifierLine[] {
    const modifiers: ModifierLine[] = [];
    
    blocks.forEach(block => {
      block.getLines().forEach(line => {
        if (line.includes("(implicit)")) {
          modifiers.push({ text: line, type: ModifierType.Implicit });
        } else if (line.includes("(crafted)")) {
          modifiers.push({ text: line, type: ModifierType.Crafted });
        } else if (line.includes("(enchant)")) {
          modifiers.push({ text: line, type: ModifierType.Enchant });
        } else if (this.isExplicitMod(line)) {
          modifiers.push({ text: line, type: ModifierType.Explicit });
        }
      });
    });

    return modifiers;
  }

  private parsePseudoModifiers(mods: ModifierLine[]): PseudoModifier[] {
    // Simplified pseudo mod generation
    const pseudoMods: PseudoModifier[] = [];
    
    // Example: Combine all resistance mods
    let totalResistance = 0;
    mods.forEach(mod => {
      if (mod.text.includes("to Elemental Resistances")) {
        const value = parseInt(mod.text.match(/\d+/)?.[0] || "0");
        totalResistance += value;
      }
    });

    if (totalResistance > 0) {
      pseudoMods.push({
        text: "Total Elemental Resistance",
        value: totalResistance
      });
    }

    return pseudoMods;
  }

  private getCategoryFromItemClass(itemClass: string): Category {
    if (itemClass.includes("Two Hand") || itemClass.includes("One Hand")) {
      return Category.Weapon;
    }
    if (itemClass.includes("Body Armour") || itemClass.includes("Helmet")) {
      return Category.Armour;
    }
    if (itemClass.includes("Ring") || itemClass.includes("Amulet")) {
      return Category.Accessory;
    }
    if (itemClass.includes("Gem")) {
      return Category.Gem;
    }
    if (itemClass.includes("Currency")) {
      return Category.Currency;
    }
    return Category.Unknown;
  }

  private isExplicitMod(line: string): boolean {
    return line.match(/^[+\-\d]/) !== null || 
           line.includes("increased") || 
           line.includes("reduced") ||
           line.includes("adds") ||
           line.includes("to maximum");
  }
}