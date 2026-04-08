# ASHENFALL GAME DESIGN DOCUMENT
## Complete Game Bible — Browser RPG

**Version**: 1.0
**Last Updated**: 2026-04-02
**Genre**: 2D Top-Down Action RPG (Persistent Progression)
**Platform**: Browser (HTML5 Canvas, vanilla JavaScript)
**Inspirations**: World of Warcraft (depth, zones, dungeons), Vampire Survivors (2D action feel), D&D (mechanics), Darkest Dungeon (atmosphere)

---

## TABLE OF CONTENTS

1. [World & Lore](#section-1-world--lore)
2. [Player Identity — Races & Classes](#section-2-player-identity)
3. [World Map & Regions](#section-3-world-map--regions)
4. [Combat System](#section-4-combat-system)
5. [Living World Escalation Loop](#section-5-living-world-escalation-loop)
6. [Itemization & Loot](#section-6-itemization--loot)
7. [Quest System](#section-7-quest-system)
8. [Dungeon System](#section-8-dungeon-system)
9. [Progression Systems](#section-9-progression-systems)
10. [Visual Design](#section-10-visual-design)
11. [UI & HUD Design](#section-11-ui--hud-design)
12. [Technical Architecture](#section-12-technical-architecture)
13. [Gameplay Loop Detail](#section-13-gameplay-loop-detail)
14. [Implementation Priority](#section-14-implementation-priority)

---

# SECTION 1: WORLD & LORE

## The Ashfall

A thousand years ago, the god Pyrevast — Lord of the Celestial Forge — was betrayed by his divine siblings and cast down from the heavens. His burning body tore through the sky for seven days, trailing ember-ash across the continent of Ereth. When he finally struck the earth, the impact annihilated the ancient empire of Solhaven and carved a crater twenty miles wide: the Ashen Maw.

The impact sent a shockwave of divine fire across Ereth. Forests ignited. Rivers boiled. Mountains cracked. A rain of burning ash fell for a full year — the event the survivors called **The Ashfall**.

But Pyrevast did not die. His shattered divine essence seeped into the land itself. The ash that blanketed Ereth carried fragments of his power — corrupting, mutating, and transforming everything it touched. Animals became monsters. The dead stirred. Plants twisted into predatory forms. The very soil pulsed with unstable divine energy.

Now, a millennium later, the world has partially healed — but the scars run deep. The Ashen Maw still smolders. Ember-ash still drifts on the wind. And Pyrevast's essence, fractured into thousands of shards scattered across the continent, continues to warp reality around it.

## The Three Ages

### Age of Foundation (Before the Ashfall)
The continent of Ereth was home to a unified civilization ruled from Solhaven, the golden city at the continent's heart. Humans, Duskelves, and Stonekith lived in uneasy alliance under the Solhaven Accord. Magic was studied, controlled, and institutionalized. The gods were distant but real — their temples dotted every city.

### Age of Flame (The Ashfall — Year 0)
Pyrevast fell. Solhaven was obliterated. The Accord shattered. Civilization collapsed. Survivors scattered to the edges of the continent. Monster populations exploded as ember-ash mutated wildlife. The first undead rose from the irradiated ruins. Entire regions became uninhabitable. This dark age lasted approximately 200 years.

### Age of Embers (Present — Year 1000)
Settlements have reformed. Trade routes exist but are dangerous. Five major factions compete for control of Ereth's future — and for the divine shards of Pyrevast's power. The frontier is being reclaimed, but the wilderness pushes back. The world is scarred, dangerous, and full of opportunity.

## The Continent of Ereth

Ereth is a landmass roughly 400 miles across, ringed by ocean on three sides and impassable mountains to the north. The Ashen Maw sits slightly southeast of center. The terrain radiates outward from the crater in rings of increasing habitability:

- **The Ashen Maw** (center): Ground zero. Molten, irradiated, crawling with the most powerful creatures on the continent. Pyrevast's remains pulse with energy here.
- **The Scarred Ring**: Blasted wasteland surrounding the Maw. Volcanic activity, ember storms, mutated megafauna.
- **The Contested Frontier**: Where civilization meets wilderness. Settlements exist but require constant defense. This is where most gameplay takes place.
- **The Settled Fringe**: Coastal and northern regions where towns are stable. Starting area for new players.

## The Five Factions

### The Wardens of the Veil
**Philosophy**: Contain Pyrevast's power. Seal the shards. Prevent anyone from using divine essence.
**Leader**: Commander Elara Ashford — a battle-hardened human veteran who lost her family to an ember-storm.
**Base**: Fort Dawnwatch, on the border of Ashveil Outskirts.
**Role**: Provide quests focused on containment, defense, and monster suppression.
**Reputation Rewards**: Defensive gear, ward enchantments, sentinel companions.

### The Emberclave
**Philosophy**: Harness Pyrevast's power. Use the divine shards to rebuild civilization — stronger than before.
**Leader**: Archon Vex Thalor — a charismatic Ashborn arcanist who believes divine power belongs to mortals.
**Base**: The Crucible, a fortified research station in Embersteppe.
**Role**: Provide quests focused on shard collection, experimentation, and power acquisition.
**Reputation Rewards**: Offensive gear, ember-infused weapons, shard-powered abilities.

### The Thornwatch
**Philosophy**: Restore the natural world. Purge Pyrevast's corruption from the land. Heal Ereth.
**Leader**: Elder Mosswyn — an ancient Duskelf druid who remembers the Age of Foundation through inherited memories.
**Base**: The Roothold, a living fortress grown from the heart of Thornwood.
**Role**: Provide quests focused on purification, herbalism, and ecological restoration.
**Reputation Rewards**: Nature magic, herbalist recipes, beast companion upgrades, terrain resistance gear.

### The Iron Consortium
**Philosophy**: Profit and progress. Ereth's resources — including divine shards — are commodities. Trade rebuilds civilization.
**Leader**: Guildmaster Brynn Copperhold — a shrewd Stonekith merchant-queen who controls the continent's largest trade network.
**Base**: The Forgeworks, the industrial heart of Ironholt.
**Role**: Provide quests focused on trade routes, resource extraction, caravan defense, and crafting infrastructure.
**Reputation Rewards**: Crafting recipes, rare materials, economic bonuses, exclusive vendor stock.

### The Ashborn Covenant
**Philosophy**: Pyrevast was not a destroyer — he was a liberator. His fall was a gift. Embrace the transformation.
**Leader**: Prophet Sable — a mysterious Ashborn mystic who claims to hear Pyrevast's voice in the ember-wind.
**Base**: The Pyrehollow, a cathedral built inside a shard-crystal cave in the Ashen Maw.
**Role**: Provide quests focused on embracing mutation, unlocking forbidden power, and communing with Pyrevast's remnants.
**Reputation Rewards**: Mutation abilities, shadow magic, shard-bonded equipment, transformation effects.

## Tone and Atmosphere

Ashenfall is **dark fantasy with persistent hope**. The world is scarred and dangerous, but communities survive, people rebuild, and the player's actions matter. It is not nihilistic grimdark — it is a frontier story.

Think:
- The Witcher's monster-haunted countryside
- WoW's sense of a living world with factions and politics
- Dark Souls' environmental storytelling through ruins and remnants
- D&D's sense of adventure and discovery

The ash is always present — drifting in the wind, coating ruins, glowing faintly at night. It is beautiful and dangerous. The world feels like it was once great and could be great again — if someone fights for it.

## Key NPCs (Hub Characters)

### Sera Flint — The Quartermaster (Starting Hub)
A no-nonsense human woman who runs the supply depot at Ashveil Outpost. Sells basic gear, potions, and ammunition. Gives the player their first quests. Pragmatic, dry humor, secretly caring.

### Old Dram — The Lorekeeper
A half-blind Stonekith scholar who sits in the corner of every tavern the player visits (he travels). Provides context on regions, enemies, and history through optional dialogue. Knows more than he lets on about Pyrevast.

### Kael Duskmantle — The Wandering Merchant
A Duskelf rogue who appears randomly in the world selling rare and sometimes questionable goods. Inventory rotates. Prices are high but items are unique. May or may not be trustworthy.

### Captain Rosk — The Bounty Master
A scarred Ashborn mercenary who manages the bounty board in every major hub. Posts daily kill contracts, elite hunts, and dungeon challenges. Gruff, professional, respects strength.

### The Ashen Stranger
A hooded figure who appears at critical story moments. Identity unknown. Speaks in riddles about Pyrevast's true nature. May be an ally, an enemy, or something else entirely. Central to the main questline's mystery.

---

# SECTION 2: PLAYER IDENTITY

## Ability Scores

Every character has six core attributes inspired by D&D. These are the mathematical foundation for all combat, progression, and skill checks.

| Attribute | Abbr | Effect |
|-----------|------|--------|
| Strength | STR | Melee damage, carry capacity, melee crit damage bonus |
| Dexterity | DEX | Attack speed, dodge chance, ranged damage, movement speed bonus |
| Constitution | CON | Max HP, HP regen, physical damage reduction, status effect resistance |
| Intelligence | INT | Spell damage, max mana, spell crit chance, ability cooldown reduction |
| Wisdom | WIS | Mana regen, healing power, detection range, status effect duration |
| Charisma | CHA | Vendor prices, faction reputation gain, companion effectiveness, rare drop luck |

**Starting scores**: All attributes begin at 8. Each race adds +2/+1 to specific attributes. Each level grants 2 attribute points to distribute freely.

## Races

### Human
**Lore**: The most numerous and adaptable people of Ereth. Humans built Solhaven and suffered most from its destruction. Now scattered across every region, they are merchants, soldiers, farmers, and explorers.

**Racial Bonuses**:
- +2 to any attribute, +1 to any other attribute (player's choice)
- **Adaptable**: +10% XP gain from all sources
- **Versatile**: Can equip any weapon type without penalty

**Starting Region**: Ashveil Outskirts (Fort Dawnwatch)

### Duskelf
**Lore**: The Duskelves retreated into the deep forests when the Ashfall came. They survived by weaving shadow magic into the canopy, creating twilight groves where ember-ash could not penetrate. They are long-lived, perceptive, and distrustful of outsiders.

**Racial Bonuses**:
- +2 DEX, +1 WIS
- **Shadowsight**: Can see further in darkness, reduced fog of war at night
- **Elven Grace**: +5% dodge chance

**Starting Region**: Ashveil Outskirts (Duskhollow Camp)

### Stonekith
**Lore**: The dwarven Stonekith survived the Ashfall underground. Their mountain halls absorbed the shockwave while the surface burned. Now they are the continent's premier miners, smiths, and engineers — but their deep tunnels have unearthed things that should have stayed buried.

**Racial Bonuses**:
- +2 CON, +1 STR
- **Stone Endurance**: +10% max HP
- **Forge Knowledge**: Crafting yields bonus quality

**Starting Region**: Ashveil Outskirts (Stonekith Waycamp)

### Ashborn
**Lore**: The Ashborn are humans who were transformed by prolonged exposure to concentrated ember-ash. Their skin carries faint ember-vein patterns that glow when they channel magic. Most people fear them. The Ashborn Covenant reveres them. They are living proof that Pyrevast's power can change mortals — for better or worse.

**Racial Bonuses**:
- +2 INT, +1 CHA
- **Ember Blood**: Fire damage dealt +15%, fire damage taken -10%
- **Shard Resonance**: Can sense nearby divine shards (shown on minimap)

**Starting Region**: Ashveil Outskirts (Ember Clearing)

## Classes

### Slayer
**Role**: Melee DPS — the frontline fighter who wades into enemies and cuts them down.
**Primary Attribute**: STR
**Secondary Attribute**: DEX
**Resource**: Fury (generated by dealing and taking damage, spent on powerful attacks)
**Weapon Types**: Swords, Axes, Maces (two-handed or dual-wield)
**Armor Type**: Heavy (plate)

**Base Abilities** (unlocked levels 1-10):
1. **Cleave** (Level 1): Swing weapon in an arc, hitting all enemies in front. Generates 10 Fury.
2. **Rend** (Level 3): Strike that applies Bleeding (DoT) for 6 seconds. Costs 20 Fury.
3. **Battle Shout** (Level 5): AoE buff — increases damage by 10% for 8 seconds. 30s cooldown.
4. **Shield Bash / Whirlwind** (Level 7): If shield equipped: stun target 2s. If dual-wield/two-hand: spin hitting all nearby enemies. Costs 30 Fury.
5. **Execute** (Level 10): Massive single-target hit. Only usable on enemies below 25% HP. Costs 40 Fury.

**Talent Specializations**:

#### Berserker (Offense)
Theme: Unrelenting aggression. More damage, more fury, more speed.
Key Talents:
- *Bloodlust*: Killing an enemy grants 15% attack speed for 5s (stacks 3x)
- *Rampage*: When Fury is full, next 3 attacks deal 40% bonus damage
- *Endless Rage*: Fury no longer decays out of combat
- *Deathwish*: Below 30% HP, damage dealt increases by 25%
- *Capstone — Onslaught*: Every 5th attack triggers a free Cleave

#### Blademaster (Precision)
Theme: Calculated strikes. Crits, bleeds, and finesse.
Key Talents:
- *Surgical Strikes*: +15% critical hit chance on bleeding targets
- *Deep Wounds*: Rend duration increased to 10s and stacks up to 3 times
- *Riposte*: After dodging, next attack is a guaranteed crit
- *Blade Flurry*: Cleave hits one additional time for 50% damage
- *Capstone — Thousand Cuts*: Critical hits reduce all cooldowns by 1s

#### Warlord (Durability)
Theme: Battlefield commander. Toughness, self-healing, and control.
Key Talents:
- *Iron Skin*: +15% damage reduction while above 50% HP
- *Rallying Cry*: Battle Shout also heals for 10% max HP
- *Undying*: Fatal blow instead reduces HP to 1 (once per 120s)
- *Commanding Presence*: Enemies near you deal 10% less damage
- *Capstone — Last Stand*: Below 20% HP, gain 30% lifesteal for 8s (90s cooldown)

### Warden
**Role**: Tank — the immovable protector who absorbs damage and controls enemy positioning.
**Primary Attribute**: CON
**Secondary Attribute**: STR
**Resource**: Resolve (slowly generates over time, boosted by blocking and taking hits)
**Weapon Types**: Sword + Shield, Mace + Shield, Spear + Shield
**Armor Type**: Heavy (plate + shield)

**Base Abilities** (unlocked levels 1-10):
1. **Shield Slam** (Level 1): Bash with shield, dealing damage and generating threat. Generates 10 Resolve.
2. **Taunt** (Level 3): Force target enemy to attack you for 4 seconds. 12s cooldown.
3. **Bulwark** (Level 5): Raise shield — block all frontal damage for 3 seconds. Costs 30 Resolve.
4. **Consecrate** (Level 7): Slam ground — AoE holy damage and slow in radius. Costs 25 Resolve.
5. **Guardian's Wrath** (Level 10): Massive shield strike that stuns for 3s and deals damage based on your max HP. Costs 50 Resolve.

**Talent Specializations**:

#### Sentinel (Pure Tank)
Theme: Maximum damage mitigation and enemy control.
Key Talents:
- *Fortified*: +20% block chance
- *Reflective Shield*: Blocking reflects 15% of damage back to attacker
- *Unbreakable*: Bulwark duration extended to 5 seconds
- *Anchor*: Cannot be knocked back or displaced
- *Capstone — Aegis of Iron*: Every 10 seconds, gain a shield absorbing 20% max HP damage

#### Crusader (Offensive Tank)
Theme: Holy damage and aggressive tanking. Kill them before they kill you.
Key Talents:
- *Holy Fire*: Consecrate also applies Burning for 4 seconds
- *Zealot's Strike*: Shield Slam deals 30% more damage and heals for 5% of damage dealt
- *Righteous Fury*: Damage dealt generates bonus Resolve
- *Divine Judgment*: Taunt also deals burst holy damage
- *Capstone — Avatar of Light*: For 10 seconds, all attacks deal bonus holy damage equal to 5% of your max HP (120s CD)

#### Bastion (Support Tank)
Theme: Protect allies (future multiplayer) and create safe zones.
Key Talents:
- *Sanctuary*: Consecrate also reduces damage taken by allies in the area by 15%
- *Inspiring Presence*: Nearby allies regenerate 2% HP per second
- *Shield Wall*: Bulwark also blocks attacks aimed at allies behind you
- *Resilience Aura*: Reduce status effect duration on yourself and nearby allies by 30%
- *Capstone — Fortress*: Create an immovable barrier at your location for 6 seconds that blocks all projectiles (90s CD)

### Arcanist
**Role**: Ranged Magic DPS — master of elemental destruction from a distance.
**Primary Attribute**: INT
**Secondary Attribute**: WIS
**Resource**: Mana (large pool, regenerates slowly, managed carefully)
**Weapon Types**: Staff, Wand + Tome
**Armor Type**: Light (cloth)

**Base Abilities** (unlocked levels 1-10):
1. **Arcane Bolt** (Level 1): Basic ranged magic attack. Low damage, no cost, fast cast.
2. **Fireball** (Level 3): Projectile that explodes on impact for AoE fire damage. Costs 25 mana.
3. **Frost Nova** (Level 5): AoE freeze around caster — all nearby enemies frozen for 2s. Costs 30 mana. 15s CD.
4. **Lightning Chain** (Level 7): Bolt jumps between up to 4 enemies. Costs 35 mana.
5. **Meteor** (Level 10): After 1.5s channel, massive AoE fire damage at target location. Costs 60 mana. 30s CD.

**Talent Specializations**:

#### Pyromancer (Fire)
Theme: Maximum damage over time. Burning, explosions, ignition chains.
Key Talents:
- *Ignite*: Fireball leaves a burning ground for 4 seconds
- *Combustion*: Enemies with Burning take 20% more fire damage
- *Pyroblast*: Fireball has a 15% chance to deal triple damage
- *Flame Shield*: Taking damage creates a fire nova (10s CD)
- *Capstone — Inferno*: Meteor now leaves a persistent fire zone for 8 seconds

#### Frostweaver (Frost)
Theme: Control and kiting. Slow, freeze, shatter.
Key Talents:
- *Permafrost*: Frost Nova radius increased 40% and leaves slowing ground
- *Shatter*: Frozen enemies take 50% more damage from the next hit
- *Blizzard*: New ability — channel a snowstorm at target area (replaces Lightning Chain slot)
- *Ice Barrier*: Absorb shield equal to 15% max HP when casting frost spells (10s CD)
- *Capstone — Absolute Zero*: Frost Nova now shatters all frozen enemies for massive damage

#### Stormcaller (Lightning)
Theme: Fast casts, chain damage, high mobility.
Key Talents:
- *Overcharge*: Lightning Chain jumps to 2 additional targets
- *Static Field*: Enemies hit by lightning take 10% more damage for 4s
- *Blink*: New ability — short-range teleport (replaces Frost Nova slot). 8s CD.
- *Thunderstrike*: Critical hits with lightning spells stun for 1s
- *Capstone — Storm Surge*: Every 4th spell cast triggers a free Lightning Chain

### Cleric
**Role**: Healer / Support — sustains themselves and (future) allies, with respectable damage.
**Primary Attribute**: WIS
**Secondary Attribute**: CON
**Resource**: Faith (generated by healing and holy attacks, spent on powerful miracles)
**Weapon Types**: Mace + Shield, Staff, Wand + Holy Symbol
**Armor Type**: Medium (chain mail)

**Base Abilities** (unlocked levels 1-10):
1. **Holy Strike** (Level 1): Melee/ranged holy damage attack. Generates 10 Faith.
2. **Heal** (Level 3): Restore 25% max HP instantly. Costs 20 Faith.
3. **Smite** (Level 5): Ranged holy bolt — damage and applies Weakened (-10% damage). Costs 15 Faith.
4. **Sanctuary** (Level 7): Create a healing zone — 5% max HP per second for 6s. 25s CD.
5. **Divine Wrath** (Level 10): Channel 2s, then massive holy AoE. Costs 50 Faith. 30s CD.

**Talent Specializations**:

#### Priest (Healing Focus)
Theme: Maximum sustain. Keep yourself alive through anything.
Key Talents:
- *Renew*: Heal also applies a HoT for 15% HP over 6 seconds
- *Circle of Healing*: Sanctuary radius increased 50% and heals 8% per second
- *Purify*: New ability — remove all negative status effects. 20s CD.
- *Grace*: Overhealing creates an absorb shield (up to 15% max HP)
- *Capstone — Resurrection*: If you die, auto-revive at 50% HP (once per 300s)

#### Inquisitor (Damage Focus)
Theme: Holy damage with self-sustain. A battle-priest.
Key Talents:
- *Penance*: Smite deals 30% more damage and heals you for 20% of damage dealt
- *Holy Fire*: Holy Strike applies Burning for 4 seconds
- *Judgment*: New ranged ability — massive single-target holy damage. 12s CD.
- *Atonement*: 10% of all damage you deal is converted to self-healing
- *Capstone — Wrath of the Divine*: Divine Wrath is instant cast and deals 50% more damage

#### Oracle (Utility / Buff)
Theme: Empowerment, foresight, and manipulation.
Key Talents:
- *Blessing of Might*: +15% damage buff for 30 seconds
- *Blessing of Wisdom*: +30% resource regeneration for 30 seconds
- *Foresight*: Dodge +10%. Enemies telegraph attacks earlier.
- *Providence*: +15% to all loot quality when active
- *Capstone — Divine Intervention*: 8 seconds of total immunity (180s CD)

### Shadowblade
**Role**: Melee/Ranged DPS — stealth, poisons, burst damage, high mobility.
**Primary Attribute**: DEX
**Secondary Attribute**: INT
**Resource**: Energy (fast regeneration, moderate pool, spent on combo attacks)
**Weapon Types**: Daggers (dual-wield), Short Swords, Throwing Knives
**Armor Type**: Light (leather)

**Base Abilities** (unlocked levels 1-10):
1. **Backstab** (Level 1): Quick melee strike. Double damage from behind. Costs 15 Energy.
2. **Poison Blade** (Level 3): Next 3 attacks apply poison DoT. 20s CD.
3. **Shadow Step** (Level 5): Teleport behind target enemy. 10s CD.
4. **Fan of Knives** (Level 7): Throw knives in all directions — AoE. Costs 30 Energy.
5. **Eviscerate** (Level 10): Massive finisher. Damage scales with poison stacks on target. Costs 40 Energy.

**Talent Specializations**:

#### Assassin (Burst Damage)
Theme: Delete priority targets from stealth.
Key Talents:
- *Ambush*: First attack from stealth deals 100% bonus damage
- *Cold Blood*: Next attack is a guaranteed crit. 45s CD.
- *Lethality*: Critical hits deal 30% more damage
- *Vanish*: Enter stealth mid-combat. 60s CD.
- *Capstone — Death Mark*: Mark a target — 30% increased damage for 8s, explodes on death

#### Venomancer (Poison / DoT)
Theme: Stack poisons, spread damage, watch enemies melt.
Key Talents:
- *Deadly Poison*: Poison stacks 5x and deals 20% more per stack
- *Envenom*: Eviscerate spreads all poison stacks to nearby enemies
- *Toxic Blade*: Backstab applies 2 poison stacks
- *Miasma*: Fan of Knives leaves a poison cloud for 4 seconds
- *Capstone — Pandemic*: When a poisoned enemy dies, stacks jump to nearest enemy

#### Phantom (Evasion / Mobility)
Theme: Untouchable. Dodge everything, strike from shadows.
Key Talents:
- *Elusiveness*: +20% dodge chance
- *Shadow Dance*: Shadow Step has 2 charges
- *Ghostwalk*: After dodging, become invisible for 1.5 seconds
- *Smoke Bomb*: New ability — blind all enemies in cloud. 25s CD.
- *Capstone — Wraith Form*: 6 seconds untargetable, attacks deal shadow damage. 90s CD.

---

---

# SECTION 4: RESOURCE SYSTEM DESIGN

*Updated: 2026-04-03 — v0.3*

## Design Principles

Every class resource model answers the question: *what does this class value?*

- **Slayer values aggression.** Fury builds only through fighting and evaporates when you stop. The resource system punishes passivity and rewards commitment.
- **Warden values endurance.** Resolve trickles in passively and spikes when the Warden does what a tank does — absorbs punishment. Staying in the fight feeds the resource.
- **Arcanist values economy.** Mana is finite. Arcane Bolt is the mana engine. The player's job is to stay solvent while spending on Fireball at the right moments.
- **Cleric values engagement.** Faith builds from Holy Strike — the ability that also heals. The Cleric is rewarded for using their kit correctly, not for waiting.
- **Shadowblade values precision.** Energy is abundant. The only real constraint is the 3-second Backstab cooldown. The game is positioning and rotation, not resource management.

## Resource Model Summary

| Class | Resource | Regen Source | Key Mechanic |
|-------|----------|-------------|--------------|
| Slayer | Fury | Attacks +12, Damage taken +6 | Decays at 20/sec after 3s no combat |
| Warden | Resolve | Passive +3/sec, Attack +8, Damage taken +12, Shield Slam +20 | Builder ability generates resource |
| Arcanist | Mana | Passive +6/sec, Basic +5, Arcane Bolt +10 | Spam button returns mana |
| Cleric | Faith | Passive +4/sec, Basic +10, Holy Strike +20 | Primary ability builds and heals |
| Shadowblade | Energy | Passive +25/sec, Basic +6 | Cooldown-constrained, not resource-constrained |

## Warden Resource Loop (Detailed)

The Warden was the most broken class in v0.2. It had no resource generation and Bulwark's 30 Resolve cost was unreachable.

Fixed loop:
1. Enter combat. Resolve trickle: +3/sec.
2. Use Shield Slam (key 1, free, 6s CD): deals damage, stuns 1.5s, generates +20 Resolve.
3. Take hits: each hit generates +12 Resolve.
4. Basic attacks: each landing hit generates +8 Resolve.
5. After ~15 seconds of active combat: enough Resolve for Bulwark (30 cost).
6. Bulwark absorbs a damage window. Resolve drops. Repeat.

Shield Slam is a *builder* ability — it costs nothing and generates resource. This is the standard pattern for resource-positive abilities in WoW (Shield of the Righteous, Maul, etc.). The player uses it on cooldown to fill the Resolve pool, then spends on Bulwark for defensive windows.

---

# SECTION 11: UI DESIGN — WoW REFERENCE

*Updated: 2026-04-03 — v0.3*

## Character Creation

The creation flow uses a self-contained 900x510px panel centered in the canvas. No element is positioned relative to the canvas bottom edge (the previous bug that hid the Continue button on smaller screens).

**Navigation flow:**
```
Title Screen
  → New Adventure → Race Select (Step 1 of 3)
                      → Continue → Class Select (Step 2 of 3)
                                     → Back → Race Select
                                     → Choose Name → Name Screen (Step 3 of 3)
                                                       → Enter (confirm) → Game
```

**Panel layout:**
- Left sidebar (175px wide): clickable list of options with color indicator bar
- Right area: full detail on selected option including description, stats, mechanics
- Footer strip (54px): navigation buttons within the panel
- Nothing extends below the panel — button positions are `panY + panH - 46` not `CH - 52`

## Settings Screen

Accessible from:
- Title screen: Settings button in the button list
- In-game: Esc key (toggles overlay without changing game state)

Displays:
- Full controls reference (all keybindings)
- Class resource system quick reference (explains how each class generates resource)


---

## Document Update — v4.2 (2026-04-04)

*The sections below supersede or extend the v1.0 content above where they conflict.*

### Version

Current: **v4.2-stable** | Lines: 9,919 | QA: 109/109 | Commits: 64

---

### Zone Architecture (current)

7 zones total. 1 surface map, 2 surface zones, 4 dungeons.

| Zone | Size | Level | Access |
|---|---|---|---|
| Ashveil Outskirts | 100×80 | 1-5 | Start |
| The Siltwood | 80×60 | 5-8 | East portal |
| Ashveil Warrens | 64×48 | 6-12 | West shaft |
| The Veil Station | 64×48 | 5-10 | Portal near outpost |
| Ashveil Depths | 72×54 | 6-8 | Collapsed arch |
| Solhaven Crypt | 36×30 | 4+ | West ruins |
| The Engine Level | 52×40 | 8+ | Resonance device |

---

### XP Design (current)

Formula: `500 × 1.75^(level-1)`. Target: 60-90 minutes on Outskirts before Lv5.

Enemy XP scaled to support this pace. The design principle is that XP comes from quests as much as kills — a player who ignores quests will progress too slowly for the gate requirements.

---

### Quest Arc Philosophy (current)

The Outskirts is not an open sandbox. It is a structured 5-gate arc that introduces one revelation per gate:

- Gate 1: The shards are affecting wildlife in ways Dram doesn't understand yet.
- Gate 2: The contamination isn't in the shards. It's in the ore and in the behavior.
- Gate 3: Kael's father classified his findings. The Watcher won't explain what it knows.
- Gate 4: Something is broadcasting. Everything is receiving.
- Gate 5: The broadcast has been running for fifty years. It started before the Ashfall.

The player reaches the Veil Station knowing more than any single NPC. Each NPC has given them one piece. Only the player holds all five.

---

### UI Architecture (v4.2)

All UI renders to a 1280×720 canvas scaled CSS 100%×100%. Mouse coordinates are adjusted for canvas DPI via `getBoundingClientRect()`.

**Render order (play mode)**:
1. renderWorld (tile map, viewport-culled)
2. renderEntities (all entities Y-sorted, viewport-culled)
3. renderInventory OR renderHUD (inventory replaces HUD)
4. renderDialog (overlay on HUD, not instead of it)
5. renderLoreOverlay (overlay)
6. renderTalentPanel, renderCharPanel, renderSkillsPanel (overlay panels)
7. renderTooltip (absolute top layer, set via G._tooltip during panel renders)

**Performance targets**: 60fps with 50+ enemies on screen, 30fps minimum. AI culling at 640px from player eliminates most off-screen computation.

**Panel sizes** (confirmed fitting at 1280×720):
- Character panel: 900×540
- Talent panel: 960×560
- Inventory: 720×500 (combined equipment + grid)
- Craft panel: 760×480

---

### Lore Canon (finalized through v4.2)

1. Shards are Pyrevast's thoughts still running.
2. The Watcher's identity is never confirmed.
3. Kael's family wrote Amendment 7 / Survey 836. He knows.
4. Dram has been right about everything but hasn't asked the right question yet.
5. The Ashfall was a mistake, not a crime. The silence before it was the crime.
6. Vorryn is not the villain. Nothing is the villain. That is the tragedy.
7. Archivist Kalos: "It is still thinking." — 536 trillion shard cycles.
8. Technician Vonn: "The frequency is not coming from the station. It is coming from everywhere."
9. Warden Brennan was not the last Warden to go down the shaft. He was the last to write about it.
10. The Covenant's patience is not theological. It is computational. They are waiting for a return value.
