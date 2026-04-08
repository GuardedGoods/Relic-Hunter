# Relic Hunter — Future Feature Ideas

## Character Creation & Customization

### Race Selection
Choose a race at the start of each run for unique bonuses:
- **Human** — +10% Gold Find, +5% XP gain (Inheritors of Loss)
- **Duskelf** — +15% Crit Chance, Shadowsight in dark zones (Children of Darkness)
- **Stonekith** — +20% Defense, +10% Armor from chest pieces (The Deep Ones)
- **Ashborn** — +15% Fire Damage, sense nearby elite enemies (What Comes After)

### Class / Archetype Selection
Choose a class that determines your starting Shard Power loadout and passive bonuses:
- **Warden** — Defensive abilities, ward-based shields, damage reduction aura
- **Embermage** — Elemental burst abilities, AoE damage, shard resonance passives
- **Thornwatcher** — Heal-over-time, poison procs, nature-based regeneration
- **Reaver** — High crit focus, lifesteal on kill, berserker rage at low HP
- **Consorter** — Gold and loot bonuses, merchant discounts, item identification

### Skill Trees
Each class has a branching skill tree (3 branches, 5 tiers each):
- Unlock new active abilities
- Enhance existing Shard Powers
- Add passive synergies (e.g., "Crits reduce Shard Burst cooldown by 1s")

---

## Gameplay Depth

### Crafting / Salvage System
- Dismantle unwanted items into **Ember Dust**
- Spend Ember Dust to: reroll one affix, add an affix to a lower-rarity item, upgrade rarity tier
- Rare materials from bosses enable targeted legendary crafting

### Shard Fragment Collectibles
- 12 lore fragments scattered across zones (rare drops, ~1% chance)
- Each reveals a piece of the Divine Contract or Pyrevast's story
- Collecting milestones (3/6/12) grant permanent bonuses
- Full collection unlocks "The Prethering" — negate one fatal blow per run

### The Ashen Stranger (Mireth's Agent)
- Random NPC appears mid-run (~5% chance every 20 kills)
- Offers cryptic trades: "Reroll one affix, but I choose which one to remove"
- Dialogue hints at deeper lore: "You chose that path. Yes. I saw."
- Can offer rare quest items or one-time power boosts

### Elemental Weakness System
- Enemies spawn with random weakness (+40% damage from that element) and resistance (-30%)
- Displayed as icons near enemy health bar
- Encourages diverse gear builds vs. pure stat stacking

### Combo / Momentum System
- Consecutive crits or kills build a multiplier (max +50% damage)
- Decays 1%/sec when not attacking
- Loot quality scales with combo meter
- Visual combo counter in combat area

### Zone Hazards
- Embersteppe: Lava ticks damage without fire resistance
- Thornwood: Poison mist stacks debuff reducing max HP
- Ironholt: Acid rain corrodes armor periodically
- Scarred Ring: Ground collapses — random damage spikes
- Ashen Maw: All hazards active simultaneously

### Danger Zones / Challenge Modifiers
- Optional "Cursed Run" modifier at start: harder enemies, better loot
- Stackable curses: "Enemies have +50% HP", "No healing", "Elite spawn rate doubled"
- Each curse increases a loot multiplier

---

## Retention & Meta Progression

### Achievement System
- Milestone achievements: "Reach Depth 50", "Kill 100 Elites", "Find a Legendary"
- Rewards: permanent stat bonuses, cosmetic titles, unlock new affix types
- Achievement tracker on main menu

### Personal Leaderboard
- Track best runs: deepest depth, most gold, fastest depth 10, most kills
- Display on main menu
- Highlight personal bests in post-run summary

### Post-Run Teasers
- After run summary, show: "2 depths from Thornwood!", "3 gold from next upgrade!"
- Drive "just one more run" behavior

### Run Streak Bonus
- Consecutive runs grant +2% gold / +1% drop rate per streak (session-based)
- Resets on browser refresh
- Displayed on main menu

### Item Log / Bestiary
- Track all unique items found (by name + rarity)
- Track all enemy types killed
- Completion percentage on main menu
- Milestones unlock cosmetic rewards

### Daily / Weekly Challenges
- "Kill 3 bosses in one run", "Find 5 epic items", "Reach depth 30 with no legendaries"
- Reward bonus gold or rare materials

---

## Visual & UI Enhancements

### Sprite Improvements
- Animated idle cycles for hero and enemies
- Attack animations (sword swing, spell cast, enemy lunge)
- Death animations per enemy type
- Particle effects for crits, elemental damage, boss abilities
- Loot drop animations (items fall from enemy, glow by rarity)

### UI Polish
- Smoother panel transitions and animations
- Mini-map showing zone progress / depth indicator
- XP bar visualization under the level display
- Drag-and-drop inventory management
- Item comparison panel (side-by-side instead of tooltip)
- Sound effects for loot drops (different per rarity), combat hits, ability use
- Background music per zone
- Screen shake intensity settings
- Mobile-responsive touch controls

### Character Customization
- Unlockable hero skins at depth milestones
- Color themes for armor based on faction allegiance
- Title display under hero name (earned via achievements)

---

## World / Lore Features

### Faction Reputation
- Actions during runs build faction favor (equipping faction gear, killing zone enemies)
- Reputation tiers unlock: faction shop items, passive bonuses, lore dialog
- Faction-specific cosmetic effects on the hero sprite

### Story Progression
- Progressive lore reveals through shard fragment collection
- Old Dram's research journal entries as collectible pages
- Environmental flavor text at depth milestones
- Boss encounters with pre-fight dialogue

### World Events
- **Ember Storm** (implemented) — divine pulse every 7 depths
- **Shambler Tide** — wave of undead at certain depths, survive for bonus loot
- **Wandering Shard** — rare mid-run event, interact for lore + XP
- **Divine Echo** — at deep depths, brief visual flash showing Solhaven's glory

---

## Technical / Infrastructure

### Backend Leaderboard
- Optional Node.js API for global leaderboards
- Submit run stats at end of run
- View top players on main menu

### Cloud Save
- Sync save data to a backend for cross-device play
- Optional account creation

### Accessibility
- Colorblind mode (alternate rarity indicators)
- Font size options
- Reduced motion mode
- Screen reader hints for key actions

### Performance
- Code-split Phaser scenes for faster initial load
- Lazy-load zone backgrounds and enemy sprites
- Web Worker for combat calculations at high speed multiplier
