# PoE Item Component Migration Checklist

## Component Structure
- [x] Break down PoEItemCard into smaller, reusable components
- [x] Move helper functions outside components
- [ ] Create proper type definitions for all components

## Components to Migrate
- [x] ItemStatus (corrupted, mirrored, unidentified badges)
- [x] Requirements (level, str, dex, int requirements)
- [x] GrantedSkills (skills granted by item)
- [x] SocketedGems (gems in item sockets)
- [x] Sockets (socket layout and links)
- [x] ItemMods (explicit, implicit, enchant, rune mods)

## Helper Functions to Extract
- [x] getCurrencyData (from exchangeData)
- [x] extractNumbers (for mod parsing)
- [x] compareValues (for mod comparison)
- [x] buildMods (for mod construction)

## Visual Elements to Implement
- [x] Item header with icon and price
- [x] Item name and type display
- [x] Properties section
- [x] Mods section with proper coloring
- [x] Value comparison indicators (up/down arrows)
- [x] Whisper button
- [x] Listing information (account, time)

## Type Definitions Needed
- [x] ModInfo type
- [x] ItemProperty type
- [x] Socket type
- [x] RequirementType
- [x] GrantedSkill type
- [x] SocketedGem type

## Features to Maintain
- [x] Mod value comparison
- [x] Tooltip for search criteria
- [x] Copy whisper functionality
- [x] Time ago display for listings
- [x] Proper coloring based on item rarity
- [x] Proper icon display
