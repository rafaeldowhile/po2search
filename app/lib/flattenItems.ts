interface RawItemCategory {
  id: string
  label: string
  entries: RawItemEntry[]
}

interface RawItemEntry {
  type: string
  text?: string
  name?: string
  flags?: {
    unique?: boolean
  }
}

interface RawItemData {
  result: RawItemCategory[]
}

export interface FlattenedItem {
  name: string // Will be type for non-unique items, or unique name for unique items
  type: string
  category: {
    id: string
    label: string
  }
  isUnique: boolean
  text?: string
}

export function flattenItems(data: RawItemData): Record<string, FlattenedItem> {
  const flattened: Record<string, FlattenedItem> = {}

  data.result.forEach((category) => {
    category.entries.forEach((entry) => {
      const itemName = entry.name || entry.type
      
      flattened[itemName] = {
        name: itemName,
        type: entry.type,
        category: {
          id: category.id,
          label: category.label
        },
        isUnique: Boolean(entry.flags?.unique),
        text: entry.text
      }
    })
  })

  return flattened
}

// Example usage:
import itemsData from '../data/items.json'
export default flattenItems(itemsData)
// 
// Result will be:
// {
//   "Crimson Amulet": {
//     name: "Crimson Amulet",
//     type: "Crimson Amulet",
//     category: { id: "accessory", label: "Accessories" },
//     isUnique: false
//   },
//   "Andvarius": {
//     name: "Andvarius",
//     type: "Gold Ring",
//     category: { id: "accessory", label: "Accessories" },
//     isUnique: true,
//     text: "Andvarius Gold Ring"
//   },
//   // ...
// } 