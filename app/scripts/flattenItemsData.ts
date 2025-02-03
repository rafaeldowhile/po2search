import fs from 'fs'
import * as path from 'path'
import { flattenItems } from '~/lib/flattenItems'


// Read items.json - go up two directories from scripts to reach app root

try {
  // Read and parse items.json
  const itemsData = JSON.parse(fs.readFileSync('./app/data/items.json', 'utf-8'))
  // Flatten the data
  const flattenedItems = flattenItems(itemsData)
  
  // Write the flattened data to a new file
  fs.writeFileSync(
    './app/data/flattenedItems.json',
    JSON.stringify(flattenedItems, null, 2),
    'utf-8'
  )
  
  console.log('Successfully created flattenedItems.json')
} catch (error) {
  console.error('Error processing items:', error)
  process.exit(1)
} 