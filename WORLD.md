# WORLD.md — Ashenfall Zone Design & Map Reference

**Agent**: World Design
**Last Updated**: 2026-04-03
**Status**: Canonical zone reference. Must stay synchronized with CONTENT.md and LORE.md.

---

## OVERVIEW — THE CONTINENT OF ERETH

Ereth is designed as a series of concentric rings radiating outward from the Ashen Maw. Each ring is a tier of danger, visual identity, and faction influence. Players progress inward toward the Maw across the course of the full game.

```
╔══════════════════════════════════════════════════════════╗
║              RIMWALL MOUNTAINS (impassable)               ║
╠══════════════════════════════════════════════════════════╣
║   NORTHERN SETTLED FRINGE — stable towns, cold, safe     ║
║         Faction: Wardens (east), Consortium (west)        ║
╠══════════════════╦══════════════════╦═══════════════════╣
║                  ║                  ║                   ║
║   THORNWOOD      ║  THE CONTESTED   ║  BLIGHTED WASTES  ║
║  (Thornwatch)    ║    FRONTIER      ║  (abandoned)      ║
║                  ║  ← START HERE →  ║                   ║
╠══════════════════╩═══════╦══════════╩═══════════════════╣
║      EMBERSTEPPE          ║        IRONHOLT              ║
║   (Emberclave)            ║    (Iron Consortium)          ║
╠══════════════════════════╣════════════════════════════════╣
║              THE SCARRED RING                             ║
║      Volcanic, extreme danger, pre-endgame zones          ║
╠══════════════════════════════════════════════════════════╣
║                    THE ASHEN MAW                          ║
║              (endgame — Pyrevast's crater)                ║
╠══════════════════════════════════════════════════════════╣
║              THE EMBER SEA (impassable south)             ║
╚══════════════════════════════════════════════════════════╝
```

---

## ZONE 1 — ASHVEIL OUTSKIRTS

**Level Range**: 1–15
**Faction Presence**: Wardens of the Veil (primary), Iron Consortium (trading post)
**Visual Identity**: Ash-grey wasteland. Dead trees with no bark, bleached white. Low ground fog at dawn. Amber ember-crystal clusters glowing on the eastern plain. Ruins half-submerged in ash.
**Weather**: Dry wind carrying fine grey ash. Occasional Ember Gusts (wind event, minor fire damage, visibility reduced).
**Music Mood**: Sparse, low strings. Wind. Distant fire crackle. Hopeful in the hub, tense in the wilderness.

---

### Ashveil Outpost — The Hub

```
╔═══════════════════════════════════════════════╗
║                NORTH GATE                     ║
║         (hunting trail → dead forest)         ║
║                                               ║
║  [DEPOT]        [COURTYARD]       [TAVERN]    ║
║  Sera Flint      fire pit          Old Dram   ║
║  Quartermaster   noticeboard       Cinder Tap ║
║                                               ║
║  WEST GATE ═══════════════════ EAST GATE      ║
║  (ruin road)    [BOUNTY HALL]   (ember fields)║
║                 Capt. Rosk                    ║
║                                               ║
║  [STOREHOUSE]  [OPEN MARKET]                  ║
║  Consortium     Kael (random)                 ║
║                                               ║
║                SOUTH GATE                     ║
║            (marsh road)                       ║
╚═══════════════════════════════════════════════╝
```

**Hub Design Principles**:
- Every major NPC function is accessible within 10 seconds of loading in
- Safe zone — enemies cannot path into the hub courtyard
- Noticeboard: daily bounties, lore notices, faction news (future)
- Market stall: rotates vendors (Kael appears 30% of sessions)
- Ambient: 4-6 NPC civilians walking, sitting, working — not interactable yet, but present for feel

---

### Sub-Zone: North Dead Forest

**Tile Composition**: 60% T.TREE, 15% T.ROCK, 20% T.ASH/ASH2, 5% T.PATH
**Enemy Population**: Ashen Wolves (primary), Ash Stalker (1 elite spawn, NW corner)
**Player Experience**: Claustrophobic. The tree density limits sightlines. Wolves attack from angles the player cannot easily anticipate. The elite in the NW corner is a genuine threat for players who wander too far at level 1-2.

**Sub-Zone Events** (planned):
- *Wolf Territorial Dispute*: Two wolf packs in adjacent areas enter a brief conflict. Player can exploit this (wolves deal damage to each other) or be caught in the middle.
- *The Grey Howl*: Triggered at dusk (if day/night cycle is implemented). All wolves in the forest simultaneously begin howling. Enemy aggro radius doubles for 60 seconds.

**Lore Object: Maren's Rest Marker** (NW corner, buried pillar):
```
"Here stood Maren's Rest — founded Year 14 A.F.
  Twelve families. Two winters. May the ash be kind.
  — M.R."
```
*Who is M.R.? The original founder. A quest line in a future update traces the descendants.*

**Lore Object: A Duskelf Arrowhead** (embedded in a white tree):
Old enough to predate the Ashfall. Duskelves were here before the outpost. Before Maren's Rest. Before the empire. What were they hunting?

---

### Sub-Zone: East Ember Fields

**Tile Composition**: 40% T.ASH/ASH2, 25% T.CRYSTAL, 20% T.SCORCH, 15% T.PATH
**Enemy Population**: Ember Sprites (primary), 1 Ash Stalker elite (far east)
**Player Experience**: Open ground. The sprites use their kiting AI effectively here — they have room to retreat, and the player must close distance without getting pelted. Crystal formations provide cover if the player learns to use them.

**The Ember Pillar** (largest crystal, center-east):
The anchor point. This is where the quest *Embers on the Wind* takes place. In future updates, the Emberclave sends researchers here. The Wardens want to seal it. The player can help either faction — or neither.

At night (future): the pillar pulses visible waves of amber light. Walking into a pulse wave briefly illuminates hidden things — footprints, old camp sites, things that are almost letters carved in the ground around it.

**Lore Object: A Collapsed Emberclave Tent** (east edge):
Recent. Within the last week. Lab equipment smashed. One researcher's journal: the last entry reads, *"The sprite that took Harlen wasn't trying to hurt him. I think it was trying to show him something."*

**NE Sub-Zone: Lava Fields**
Small zone. High hazard. Designed as an optional challenge area for players who stray. The lava damage punishes ignorance and rewards route-planning. Future: heat-resistant boots crafted from Stonekith materials allow passage.

**Lore Object: Melted Consortium Wagon** (lava field border):
Iron wheels, stone cargo containers, all warped by heat. The manifest, somehow intact on a stone tablet: *"12 crates ember shard — SEALED — do not open — consigned to Archon Thalor, The Crucible."* The crates are gone. Where did they go?

---

### Sub-Zone: West Ruins

**Tile Composition**: 50% T.WALL/RUIN, 30% T.ASH/ASH2, 20% T.PATH
**Enemy Population**: Corrupted Shamblers (primary), 1 Ash Stalker elite (deepest ruin)
**Player Experience**: The ruins create natural corridors. Shamblers are slow but hit hard. The zone rewards patience — rushing in gets players surrounded. Moving ruin-by-ruin, using walls for cover, is the correct play.

**The Veil Station Ruins** (largest building, center-west):
The original Warden forward post. Abandoned in Year 820 A.E. after a shambler infestation. The walls still stand.

Interior lore objects (future readable items):
- *Bunk assignment roster*: 24 names. By the end of the station's operation, only 6 were still checked off as active.
- *Ward-seal maintenance log*: Last entry 200 years ago — *"Seal 7 degrading. Request replacement crystal. Awaiting supply shipment."* The supply shipment never came.
- *Duty commander's personal journal*: Final entry — *"Something is moving through the walls. Not the shamblers. Something else. Something that remembers what this building was for."*

**The Something In The Walls**: A planned environmental encounter. A shambler that moves *through* BWALL tiles — phasing through at low intervals. Not fully implemented. Flagged for Milestone 8.

**Lore Object: A Child's Toy** (rubble pile, west ruin cluster):
A carved wooden horse, legs broken off. No indication of who left it or when. Just there. This is the kind of detail that does more work than a paragraph of history.

---

### Sub-Zone: South Marsh

**Tile Composition**: 65% T.MARSH, 20% T.ASH/ASH2, 10% T.WATER, 5% T.PATH
**Enemy Population**: Corrupted Shamblers (primary), Ashen Wolves (northern edge), Ash Stalkers (patrol, 1 spawn point)
**Player Experience**: The slowest zone in the outskirts. The 45% movement penalty is punishing in combination with shambler swings. Players learn to kite, use their environment, and pull enemies one at a time. This is where bad habits get punished.

**The Blackwater Sink** (deepest marsh, southern edge):
A pool of dark water that reflects incorrectly. Future mechanic: interact with it, and the player's reflection shows them at a different level — older, wearing different gear. Not their level — a possible future version of them. Or a past one. It does not say.

The Covenant marks this as a pilgrimage site. Covenant graffiti on the rocks around it: *"He sees through still water."*

**The Drowned Shrine** (partially submerged structure, western marsh):
A pre-Ashfall temple to Thresh — the god of passage. The death-god's shrine, in a swamp full of things that did not properly die. The irony is not subtle. Future quest: retrieve a Thresh-icon from inside for a Cleric class quest, confronting the theology of undeath directly.

---

## ZONE 2 — EMBERSTEPPE

**Status**: Planned (Milestone 13)
**Level Range**: 15–25
**Faction Presence**: Emberclave (primary), Ashborn Covenant (underground), Wardens (border posts)
**Visual Identity**: Volcanic plains. Cracked black stone with veins of orange that glow from below. Geothermal vents releasing steam clouds. Shard formations everywhere — not individual crystals like Ashveil's fields, but entire *walls* of interlocked crystal. The sky is always orange near the horizon here from distant volcanic haze.
**Weather**: Ember Storms (periodic, heavy fire damage without fire resistance), Shard Pulse Events (shards glow intensely, enemy empowerment window)

**The Crucible** (Emberclave Hub):
A fortress-laboratory. Half research station, half fortified compound. The exterior shows the careful precision of Stonekith engineering. The interior shows what happens when Stonekith engineering is applied by people who care more about their experiments than their safety.

Key interior areas:
- *The Resonance Hall*: Where shards are tested. Constant low hum. Researchers wear ward-mesh gloves. Thalor's office is here, always locked.
- *The Recovery Ward*: Where researchers who had accidents go. Many of the patients are Ashborn now. Some of them are fine with this. Some are not.
- *The Sub-Basement*: Not on any official map. The Breach operates here.

**Zone Mechanic — Thermal Vents**:
Geothermal vents periodically jet steam. Standing in the jet: 12 damage/second. But the vents create natural barriers that redirect enemy pathing. Skilled players use them as choke points.

**Zone Mechanic — Shard Resonance Field**:
Within 150px of any large shard cluster, the player's resource bar regenerates 50% faster. But abilities cost 20% more. The field incentivizes ability use while making efficiency matter more.

**Enemy Ecology**:
- *Ember Wraiths*: Ranged. Float. Immune to burn. The Emberclave's failed experiments.
- *Cinder Hounds*: Fast pack hunters. Like Ashen Wolves but fire-infused. Leave burning ground on death.
- *Forge Golems*: Stonekith-engineered constructs that have been running without operators for decades and have developed... opinions. Heavy, armored, slow, hit like geology.
- *The Empowered* (elite): Ashborn who went too far. They are not hostile by choice — their shard-bonding has overridden their volition. This should feel sad.

**Key Quests**:
- *The Crucible Incident*: Something got out of the Sub-Basement. The Emberclave wants it contained quietly. Thalor has not told anyone what it is.
- *Readings from the East*: The shards are pulsing in a pattern. Thalor needs someone who can go into the field and record the intervals without touching the shards. The player does this. The pattern, decoded, spells something.
- *What Harlen Saw*: Sequel to the Ashveil lore thread. The missing researcher from the collapsed tent appears in Embersteppe — changed. He is now Ashborn. He remembers what the sprite was trying to show him. He needs help processing it.

---

## ZONE 3 — THORNWOOD

**Status**: Planned (Milestone 13)
**Level Range**: 15–25 (parallel to Embersteppe — player chooses)
**Faction Presence**: Thornwatch (primary), Duskelf communities, Ashborn Covenant (pilgrimage routes)
**Visual Identity**: Dense canopy. Permanent twilight. Enormous trees, some dating to before the Ashfall, their trunks wider than buildings. The ash has not fully penetrated here — the ground is actual soil, actual green, almost shocking after the grey of Ashveil. But at the edges of the Thornwood, the transition zones show corrupted growth: twisted black vines, trees that bleed amber sap, flowers that turn toward the player and track movement.
**Weather**: Rain (obscures vision, muffles sound, makes the world feel intimate and isolated), The Overgrowth Events (corrupted vegetation advances a zone boundary — see Lore)

**The Roothold** (Thornwatch Hub):
A living fortress. The walls are trees, grown into interlocking shapes over centuries by Thornwatch druids. The floors are packed earth and stone. The ceiling in the great hall is open to canopy — rain falls straight through and runs off to the sides in channels. Elder Mosswyn's quarters are at the top of the tallest tree, accessible by a staircase carved into the heartwood.

**Zone Mechanic — Canopy Shadows**:
Areas beneath dense canopy have a darkness modifier. Duskelf players have full visibility (Shadowsight). Other races have reduced detection range. Enemies in shadow have 15% bonus dodge chance.

**Zone Mechanic — Corruption Zones**:
Areas where the Overgrowth has advanced. Moving through corruption: stacking debuff (Tainted, reduces max HP by 5% per stack, max 5 stacks, clears on leaving the zone). Thornwatch sells Purifying Salves that grant 60 seconds of corruption immunity.

**Enemy Ecology**:
- *Ashroots*: Corrupted trees that animate when approached. Slow, immovable (they are rooted), but have a vine-sweep AoE with long range. Immune to fire (burning them makes them stronger).
- *Blightwasps*: Swarm attackers. Small, fast, low individual damage. Apply Tainted on hit. Die in 2 hits. Come in groups of 15-20.
- *The Taken*: Animals that have been fully absorbed by the Overgrowth. Their original form is visible within the corrupted mass — a stag with vines replacing its ribcage, a bear walking on three legs because the fourth has rooted to the ground. These should be disturbing.
- *Hollow Sentinel* (elite): Duskelf warriors who have been consumed by the Overgrowth but are still fighting — against what, they no longer remember. The most ethically complex enemies in the game.

---

## ZONE 4 — IRONHOLT

**Status**: Planned (Milestone 13+)
**Level Range**: 25–35
**Faction Presence**: Iron Consortium (primary), Stonekith communities, Warden garrison
**Visual Identity**: Industrial. Massive stone structures, the largest built things in the Age of Embers. Furnace smoke. Mechanized elements — Stonekith-engineered lifts, conveyor systems, automated defenses. The Forgeworks complex is visible from five miles out — a tower of black iron and orange fire.
**Weather**: Smog events (visibility reduced, non-fire DoT), Acid Rain (occurs near chemical refineries — corrodes armor, reduces effective armor rating)

---

## ZONE 5 — THE SCARRED RING

**Status**: Planned (endgame approach)
**Level Range**: 35–45
**Visual Identity**: Post-apocalyptic volcanic. The ground itself is unstable. Lava rivers. Obsidian formations. The sky is permanently lit by the Ashen Maw's glow on the horizon — the first zone where the Maw is visually present as a destination.

**Zone Mechanic — Ground Instability**: Every 90 seconds, a seismic event. Random SOLID tiles in a 20-tile radius of the player become passable for 8 seconds (ground collapse) then close again. Being caught in a collapsing tile: instant death.

---

## ZONE 6 — THE ASHEN MAW

**Status**: Planned (endgame)
**Level Range**: 45–50 (hard cap)
**Visual Identity**: Ground zero. The crater is twenty miles wide. The rim is a ring of fused obsidian where Pyrevast's body struck. Inside the crater: concentric rings of increasing heat and shard density. At the center — the Pyrehollow, Sable's cathedral, built in the only habitable zone of the Maw, sustained by Sable's own shard-bonding.

**Zone Mechanic — Shard Resonance Intensity**: The player's class resource drains continuously at the center of the Maw. Active combat constantly replenishes it. The zone forces the player to keep moving and engaging — standing still is not sustainable.

**The Pyrehollow** (Ashborn Covenant Hub, Endgame):
Built inside the largest shard-crystal cave on Ereth. The crystals in the walls are the size of houses. They pulse with Pyrevast's dreaming. Inside: Sable's sanctum, the Covenant's inner circle, and — at the deepest point — the place where Sable has been having her conversation with the largest shard fragment. The player can enter this room and see what she's been talking to.

---

## DUNGEON INSTANCES

Dungeons are separate instanced zones — not part of the open world. The player enters via a physical gate in the open world.

### The Barrow (Zone 1 Dungeon)

**Location**: Accessible from West Ruins (sealed gate, requires Warden key or lockpick)
**Level Range**: 8–12
**Theme**: The dead who didn't go properly. Pre-Ashfall burial site. The Ashfall's energy reanimated everything buried here.
**Boss**: The Barrow Warden — a Stonekith elder who was buried 50 years before the Ashfall with full honors, was reanimated by the impact, and has been guarding the tomb from intruders for a thousand years. He believes he is still performing his duty. He is not hostile on sight — he wants to talk. Whether the fight happens depends on the player's choices.

**Dungeon Layout** (3 floors):
```
Floor 1 — The Outer Tombs
  Entry → Crypt A (wolves that were buried as companions) → Crypt B (the servants) → Stairwell

Floor 2 — The Inner Chambers  
  Stairwell → Hall of Names (lore wall — 200 names carved in stone) → The Chapel (Thresh shrine, still faintly active) → Guard Room

Floor 3 — The Warden's Keep
  Boss arena → Treasure vault → Exit seal
```

**Unique Mechanic**: The Chapel on Floor 2. If the player interacts with the Thresh shrine and offers a resource (any class resource, 25% of maximum), the Barrow Warden's hostility is reduced when they meet him. Full offering: the fight becomes optional. He tells them about the Ashfall from the perspective of someone who slept through it and woke up in the aftermath.

---

### The Crucible Run (Zone 2 Dungeon)

**Location**: Accessible from Embersteppe (Emberclave provides key, or player steals one)
**Level Range**: 20–25
**Theme**: The Emberclave's Sub-Basement, finally open. The Breach's experiments. What they made. What got loose.
**Boss**: The Recombined — a Breach experiment that merged three willing Ashborn subjects into a single entity to see if the combined shard resonance would create something greater. It did. The something is angry.

---

### The Corrupted Vault (Zone 3 Dungeon)

**Location**: Accessible from Thornwood (Thornwatch provides key)
**Level Range**: 22–27
**Theme**: A pre-Ashfall treasury, now consumed by the Overgrowth. The vault contents are entombed in black vines. Inside: items of immense historical value, and a plant-mind that has been slowly reading them for a thousand years.
**Boss**: The Archivist — what a library becomes when the Overgrowth absorbs it. It has read every document inside. It speaks in quotations from dead authors. It is sad and dangerous and cannot be reasoned with because it has already considered every argument.

---

## WORLD EVENTS

### The Ember Storm
**Frequency**: Every 7 in-game days (if day/night cycle is implemented; otherwise every 45 minutes real time)
**Effect**: A pulse from the Ashen Maw radiates outward. All ember crystals in the world glow intensely for 5 minutes. All enemies deal 20% bonus fire damage. All shard-based effects (Ashborn racial, Emberclave items, Covenant abilities) are empowered by 30%. A wave of hallucination-like visual effects plays — images of Solhaven at its height, ghostly and brief.
**Opportunity**: Elite enemies spawn at +2 during Ember Storm. Loot quality of crystal deposits is increased. The Storm is a threat and a reward — players who prepare and engage with it gain significant advantage.

### The Shambler Tide
**Frequency**: Every 3 in-game days
**Effect**: Shamblers across the South Marsh all simultaneously move toward the nearest hub. A wave of 8-12 shamblers advances on Ashveil Outpost from the south gate. If the player does not intercept them, they reach the courtyard and attack civilians. NPCs cannot die (for now), but shop inventories are unavailable until the tide is cleared.
**Tone**: Not a world-ending event. A recurring problem. The people of Ashveil have dealt with it before. Sera Flint's tone during a tide is irritated, not afraid — *"Again. Every time. It's like they have a calendar."*

### The Wandering Shard
**Frequency**: Random, approximately once per 20 minutes of play
**Effect**: A free-floating shard fragment — visible as a small amber light drifting slowly through the wilderness — appears at a random location outside the hub. If the player reaches it and interacts, they receive a lore fragment (random from a pool of 40) and a small XP bonus. The shard vanishes on interaction or after 3 minutes.
**Purpose**: Rewards exploration. Delivers lore in bite-size pieces. Creates the feeling that the world is alive and strange.

---

## ZONE CONNECTIVITY AND TRAVEL

```
Ashveil Outskirts
├── North Gate → North Forest → [no exit yet, future: Northern Fringe]
├── East Gate → Ember Fields → [future: Embersteppe border]
├── South Gate → South Marsh → [future: Blighted Wastes spur]
└── West Gate → West Ruins → [future: Thornwood approach road]

Dungeons (accessed from open world):
├── The Barrow → from West Ruins (gate)
├── The Crucible Run → from Embersteppe (gate)
└── The Corrupted Vault → from Thornwood (gate)
```

**Travel Design Principle**: The player always knows what direction progress lies. The further they go from the hub in any direction, the harder the enemies. There is no "wrong" direction — just different dangers. A player who runs full south into the marsh at level 1 will die, but they will understand why.

**Waypoints** (planned): Discovered by finding and interacting with Warden waypost markers in each zone. Once discovered, players can fast-travel between wayposts. The Wardens built them to maintain their patrol network. Using them requires either Warden reputation or a fee (Iron Consortium waypost tax).

---

## VISUAL DESIGN LANGUAGE

### Color Palette by Zone

| Zone | Primary | Accent | Hazard |
|------|---------|--------|--------|
| Ashveil Outskirts | Grey-brown #3d3530 | Amber #cc8833 | Lava orange #8b3a1a |
| Embersteppe | Black #1a1208 | Orange #cc4400 | Shard glow #ff6633 |
| Thornwood | Deep green #1e2e18 | Twilight blue #2a3a4a | Corruption black #0a0808 |
| Ironholt | Charcoal #2a2522 | Iron blue #334455 | Acid yellow #aacc22 |
| Scarred Ring | Obsidian #0a0808 | Lava red #882211 | Void purple #331144 |
| Ashen Maw | Pure black #050505 | Divine amber #ffdd44 | Shard white #fffafa |

### Tile Transitions

Adjacent zones should share transition tiles. Ashveil Outskirts into Embersteppe:
- T.SCORCH increases in frequency
- T.ASH transitions to a new tile: T.CINDER (black ash, orange veins)
- T.CRYSTAL increases in size and density
- Trees disappear entirely; replaced by obsidian spires

These transitions happen over approximately 15 tiles — no hard borders. The player feels themselves moving into new territory before they are technically there.

### Lighting Philosophy

Ashenfall has no dynamic lighting engine (this would require WebGL). Lighting is simulated:
- Glow functions create radial gradient overlays for crystals, fire, magic effects
- Screen-level tint shifts during events (Ember Storm: amber overlay, 25% opacity)
- Enemy glow properties create ambient presence effects
- Loot orbs use glow + sin animation for visual priority

Future addition: A particle-layer system for ambient effects — drifting ash particles across the entire screen, heavier near crystals, lighter near the hub.

---

*End of WORLD.md — v1.0*
*Next expansion: dungeon floor maps, NPC patrol routes, event trigger tables*

---

## PART TWO: DETAILED ZONE MAPS

### Ashveil Outskirts — Full Grid Map

The map is 100×80 tiles. The hub sits at tiles (38–62, 30–50). Below is a schematic using ASCII shorthand. Each character represents approximately 4×4 tiles.

```
Legend:
  # = T.TREE (impassable)    ~ = T.MARSH (slow)     * = T.CRYSTAL
  R = T.ROCK (impassable)    W = T.WATER             L = T.LAVA
  . = T.ASH/ASH2             = = T.PATH              F = T.FLOOR
  w = T.WALL/RUIN             B = T.BWALL (building)  _ = T.BFLOOR
  S = Enemy spawn point       ! = Elite spawn point   N = NPC position
  ^ = Lore object             ? = Secret/hidden        D = Dungeon gate

Y=0  ################################...............RRRRR..########LLLLLL
Y=4  ##.....######.........##########.............R.......########LLLLLLL
Y=8  ###...#.....#..^^.....########...............RRRR...*RRRRRRRRLLLLLLL
Y=12 ###..^..SS..#.......SSSS.....##.................****...........SCORCH
Y=16 ###...#######......S..S...###.....................***..........*******
Y=20 ##...####SS##..........RRR......................*.*..R.........SCORCH
Y=24 ##..####..SSS.......R..........R...............***.R..............###
Y=28 #..S.!S.#....w..wwww......R................##...*.........R.........#
Y=32 #...S.S.###..wwwwww.........R..........####...*.*......SS..........##
Y=36 #...SS#####.wR.w.w.......R..........####.....S*S*S..SS.............##
     ←WEST RUINS→     ←←←PATH====PATH====PATH====PATH→→EAST EMBER FIELDS→
Y=40 .....^.^.....=====BBBBBBBB===BBBBBBBB=====*....S..SS..............###
     ←←←←←PATH←←←←HUB:FlintNPC_TavernBounty→→→PATH→→→→→→→→→→→→→→→
Y=44 .....D.......=====BBBBBBBBB==BBBBBBBBB=====..SSS....................#
Y=48 ..S....R.....=====BBBBBBBB====================...S.SS..............##
     ←←←←←←←←←←←←←←←PATH←←←←←←←PATH→→→→→→→→→→→→→→→→→→→
Y=52 ~~~~~...........S.SSSSSS.S......!SS..SS..SS.....S....SS..............
Y=56 ~~~~~~~~~~~.....~.~S.SS.S.....SSSS.SSS...........S..SS..............
Y=60 ~~~~~~~~~~.....^~~~~~.S.~~...SS.S.SSS....R....S...S.....!...........
Y=64 ~~~~~~~~~~!....~~~~^~~.~~~~~.........S...R......S..........SS......~.
Y=68 ~~~~D~~~~~~....~~~~~~~~~.~~~~~.........S.....R.......S.....S.....~~~.
Y=72 ~~~~~~~~~~......~~~~~~~~~~.~~~~.......R......SS....R.......S.......~~
Y=76 ~~~~~~~~~~^.....~~~~~~~~~~.~~~~~^............................S.......~
     ←←←←SOUTH MARSH (shamblers, stalkers)→→→→→→→→→→→→→→→→→→→→→

Key locations (tile x,y):
  HUB CENTER: (50, 40)
  Sera Flint NPC: (43, 35) — Quartermaster Depot NW
  Old Dram NPC (future): (57, 35) — Cinder Tap NE
  Captain Rosk (future): (50, 46) — Bounty Hall S
  Kael Duskmantle (random): (53, 42) — Market area
  Barrow Gate: (7, 44) — West Ruins, large ruin cluster
  North Stalker !: (13, 7) — NW forest
  East Stalker !: (82, 55) — Far east fields
  South Stalker !: (6, 62) — Deep south marsh
  Maren's Rest Marker ^: (50, 18) — North path, buried pillar
  Ember Pillar *: (79, 36) — East fields anchor
  Blackwater Sink ^: (22, 64) — South marsh pool
  Veil Station Ruins w: (8-16, 36-42) — West ruins cluster
  Lava Fields L: (85-98, 0-14) — NE corner
```

---

### Named Locations — Ashveil Outskirts

Every location with a name exists in the game world. Named locations without implementation markers are planned for future milestones.

#### Hub District

**The Quartermaster Depot** (tiles 38-45, 31-37) — IMPLEMENTED
Stone building, Warden-built. Sera Flint's domain. Supplies, basic gear, first quests. The building has a Warden seal above the door — the same style as the Veil Station seal, but newer, still active. Inside: supply crates stacked to ceiling, a handwritten inventory on the wall, a cot behind a curtain where Flint sleeps.

**The Cinder Tap** (tiles 55-61, 31-37) — IMPLEMENTED (partial — NPC needed)
Marta Irongrip's tavern. Stone exterior, salvaged wood interior. The bar is a single piece of stone, smoothed by years of elbows. A noticeboard by the door, a fire in a stone hearth, six tables. Old Dram's corner: always the table furthest from the door, facing it. His book stack is four high, his ale is always half-drunk, his candle is always lit regardless of daylight.

**The Bounty Hall** (tiles 47-53, 43-49) — PLANNED (M8)
Captain Rosk's operation. Clean, organized, slightly intimidating. The bounty board takes up an entire wall — posted contracts in rows, completed contracts archived in folders on the opposite wall. Rosk sits at a desk in the center, doing paperwork with the focused patience of someone who has made peace with administrative work.

**The Consortium Storehouse** (tiles 38-43, 43-49) — PLANNED (M10)
Consortium lease, Iron Consortium trade license framed on the wall. Run by a rotating Consortium factor — never the same person two weeks in a row. Sells goods unavailable at the depot: imported food, Stonekith tools, rare materials passing through. Closed one day per week (the day changes without notice — the Consortium considers this a feature, not a bug).

**The Open Market** (tiles 48-58, 40-44) — PLANNED (M8)
Courtyard space with portable stalls. Kael Duskmantle appears here at random intervals (30% of sessions). When not Kael, various unnamed traders with rotated stock. The market is where rumors travel — future implementation will make it a source of world-state information.

**The Communal Fire** (tiles 49-51, 40-42)
Always burning. The outpost's social center. Travelers warm themselves here. Civilians eat lunch here. At night, someone usually tells a story. The fire cannot be extinguished — it is built over a small shard deposit in the ground, which has been providing fuel for 80 years. The Wardens know about this. They have decided to pretend they do not.

#### North Forest District

**The Treeline Entry** (tiles 38-62, 24-28)
The transition from ash ground to forest. The path northward passes through here. The trees begin suddenly — the first twenty feet of forest are noticeably denser than what follows, as if the trees are denser at the boundary. They are. There is a shard cluster under the root system at the boundary that has been slowly strengthening the trees there for two centuries.

**The Pack Run** (tiles 44-70, 0-20)
The hunting circuit of the largest wolf pack in the north forest. Eight wolves, irregular circuit, 90-second cycle. The Threefang elite at (15, 8) claims this territory. Players who learn the patrol route can intercept the pack at optimal moments.

**Maren's Rest Burial Mound** (tiles 44-56, 14-18) — PLANNED (M9)
Not just a marker. The original settlement had a cemetery. The ash covered it. Future: scything ash away reveals grave markers, personal items, small artifacts. The graves are intact — the ash preserved rather than corrupted because the concentration here was low and the Thresh protocols were still partially functional in the early years.

**The Amber Hollow** (tiles 28-36, 4-12) — SECRET
Not on any map. A depression in the forest floor, hidden by tree roots arching over it. At the bottom: a dense shard formation so small it would be missed at normal running pace. The shard at the center of this formation is unlike any other in the outskirts — it is warm to the touch and does not pulse. It hums continuously at a frequency slightly below hearing.

This is where the wolf that came to the gate was going. Not to threaten anyone. To sit near this. Ashborn players feel it from fifty feet away — a pull toward it, a warmth. Touching it triggers a vision fragment: Pyrevast at work, brief, less than two seconds, but clear. The first glimpse most players will have of what he actually was.

#### East Ember Fields District

**The Sprite Nesting Ground** (tiles 65-82, 16-28)
Ember Sprites are not random. They cluster around specific crystal formations that have been active long enough to develop thermal pockets — warm air columns that the sprites use for locomotion. The nesting ground is the densest thermal zone in the outskirts. At its center: the Matron's position, an elite sprite that coordinates three cohorts of six.

**The Ember Pillar** (tiles 78-80, 34-38)
The largest crystal formation in the outskirts. Fifteen feet tall, a single growth axis with crystalline branches. It predates the smaller formations around it by at least two centuries — it formed within 50 years of the Ashfall, the first formation in the region. At night (future day/night cycle): the pillar produces visible amber light pulses at the seven-day interval. Standing within 10 tiles: the pulse is felt as a vibration in the chest. No damage. Just presence.

**The Collapsed Research Site** (tiles 88-95, 28-34)
A recent Emberclave camp — three months old, maximum. Torn canvas, broken instruments, one intact lantern still burning (shard-fueled, not oil). The researcher's journal (readable item): last entry describes a sprite that approached rather than fled. It produced a pattern of light that the researcher attempted to document before... the entry ends.

A separate notebook, half-buried: sixteen pages of light-pattern sketches. Different patterns for different behaviors. This is the Emberclave's incomplete work on sprite communication. Taking it starts a chain — a Crucible researcher in Embersteppe will pay for it, or Old Dram will recognize it as significant.

**The Lava Shelf** (tiles 85-100, 0-10)
The highest elevation point in the outskirts, slightly elevated. Looking out from the shelf's northern edge (the non-lava side): on clear days, the Rimwall Mountains are visible. On the clearest days, slightly to the east, a smear of distant orange on the horizon. Not sunrise — in the wrong direction. That is Embersteppe's volcanic haze.

#### West Ruins District

**The Veil Station Ruins** (tiles 7-23, 33-43)
The original Warden outpost, built Year 210 A.E., abandoned Year 820 A.E. Three main structures and three partial-collapse structures. The main building has two stories — the upper floor is accessible via an intact staircase, the lower floor connects to a basement that has been sealed (the seal is Warden-standard ward-crystal; it can be bypassed at Warden rank Honored or higher, or by specific quest progression).

Interior significant objects:
- Bunk room (upper): 24 bunks, 6 personal effects remaining (all others removed when station was abandoned)
- Command desk (main floor): maps pinned to the wall, most rotted, one intact — shows the original patrol perimeter, which extends four tiles further north than the current patrol goes
- Ward-seal chamber (main floor): the ward-seal Sera Flint wants, mounted above the inner door, still active and warm
- Duty log (main floor): 20 years of mundane entries, then increasingly terse, then the final entry about something moving through walls
- Basement seal: Warden ward-crystal, intact, rated for another 200 years

**The Burial Alcove** (tiles 3-7, 38-42)
A natural depression partially enclosed by collapsed stone. Two grave markers, stone-carved, pre-Ashfall style. Names: "Taren" and "Aleth." No dates. No other information. Someone buried these people before there was a station here — before there was an outpost. This is old ground.

If the player has Old Dram's Language Fragment and examines the markers: the names are in pre-Ashfall common. Taren means "the one who remained." Aleth means "the one who went ahead." A married couple, perhaps. Or something stranger.

**Doorway Facing East** (tiles 22-24, 40)
In the ruins, among the partial-collapse structures, there is a doorway that leads nowhere — both wall sections beside it have fallen, but the doorframe itself stands. It faces east. Every day at noon (future time system), the light that comes through the doorway falls at exactly the same angle it would have a thousand years ago. The building around it has collapsed. The doorway has not moved.

Nothing magical about this. Stone endures differently than wood. But it looks like something deliberately maintained, which is why it feels different.

#### South Marsh District

**The Blackwater Sink** (tiles 18-26, 62-68)
Described in detail under zone sub-areas. The key mechanic detail: the reflection problem. The pool is 12 tiles across, 8 tiles deep, at the lowest point of the marsh. The water's surface is slightly thicker than water should be — not viscous, but resistant. Ripples spread slower than they should and take longer to still.

In the reflection: the sky is a different color. Not obviously — the difference is subtle. Slightly less orange, slightly more violet. The sun's position is correct for the time of day, but the hue of the light is wrong. As if the reflected world is in a different season.

Proximity effects: animals do not approach within four tiles. Shamblers gather at the outer edge (eight tile radius) but do not approach closer. Ember sprites have never been observed in the marsh. There is something about the Blackwater that the ash-corrupted things feel and avoid.

The Covenant pilgrims who come here are not experiencing the Sink incorrectly. They are feeling the one place in the outskirts where Thresh's domain is still partially coherent — the thin place between living and passed, where the death-god's remaining function is still slightly active. The reflection shows not a different world but a different time — the time that exists on the other side of Thresh's passage. Whatever the afterlife is, in Ashenfall's theology, the Blackwater is close to the door.

**The Drowned Shrine** (tiles 8-14, 52-58)
A pre-Ashfall Thresh temple, partially submerged in marsh water. The structure is stone, Solhaven-era construction, recognizable by the arch style. Twelve feet of the original building are above water. The interior: intact altar, Thresh iconography (pale hand, open palm), four intact candles that stay lit regardless of the water around them.

Interacting with the altar: class resource restored to full. This works for all classes and is the only passive benefit available in the south marsh.

A Cleric player who examines the iconography more carefully: the hand on the altar is not Thresh's standard pose (guiding outward, palm forward). This hand is palm-up, as if receiving. As if waiting. The Cleric can commune here for extended dialog — a one-way conversation where they speak and the shrine does not answer, but the room feels less empty than it should.

**The Deepest Shambler** (tiles 38-44, 72-78)
At the southern edge of the map, furthest from the hub, in the deepest marsh: a shambler that does not move. It is standing still, facing south — facing away from everything. It has been standing here since the outpost was founded. Sera Flint knows about it. The Wardens leave it alone. It has never attacked anyone.

If approached: it turns, looks at the player, and turns back. No attack. No dialog. It faces south.

Old Dram, if asked about it: *"I went to look at it once. Years ago. I stood there for a while. I don't know what it's looking at. There's nothing south of here except the Ember Sea. Whatever it was when it was a person — whatever it's trying to see, I couldn't find it. I left it there. It's not hurting anyone."*

---

## PART THREE: DUNGEON FLOOR MAPS

### The Barrow — Complete Layout

**Access**: West Ruins, tile (7, 44) — sealed gate, requires Warden Barrow Key (quest reward from *The Veil Station*) or lockpick (Shadowblade class skill, or purchased from Kael Duskmantle)

**Tone**: Quiet. Not the silence of absence — the silence of something waiting. The Barrow was well-made and has survived a thousand years because it was built to last. Everything is still where it belongs. The problem is that some of what belongs here is now walking around.

```
╔══════════════════════════════════════════════════════════╗
║                   THE BARROW — FLOOR 1                    ║
║                    THE OUTER TOMBS                        ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  [ENTRANCE]═══════════════[ANTECHAMBER]                   ║
║       ↓                        ↓                         ║
║  [CRYPT A — COMPANIONS]   [SUPPLY ALCOVE]                 ║
║   Wolf graves, 6 wolves       Abandoned gear ←loot        ║
║   animated on entry                                       ║
║       ↓                        ↓                         ║
║  [GALLERY]══════════════════[CRYPT B — SERVANTS]          ║
║   Portrait carvings on wall    8 shamblers                ║
║   ← lore (faces of buried)     Slow, predictable          ║
║       ↓                        ↓                         ║
║  [PASSAGE]══════════════════════↓                         ║
║   3 wolf patrol                                           ║
║       ↓                                                   ║
║  [STAIRWELL — Floor 2]                                    ║
║   Sealed door (requires 1 key from Crypt A wolves)        ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════╗
║                   THE BARROW — FLOOR 2                    ║
║                   THE INNER CHAMBERS                      ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  [STAIRWELL UP]═══════[HALL OF NAMES]                     ║
║                         ↕ 200 names carved in stone       ║
║                         ↕ Old Dram's target text here     ║
║                         ↕ 4 Revenants (if M8+ patch)      ║
║                         ↕                                 ║
║            [THE CHAPEL]═╝                                  ║
║            Thresh shrine ← interact: resource restore     ║
║            Offering mechanic (reduces Warden hostility)   ║
║            4 bound shamblers, slow patrol                  ║
║                    ↓                                      ║
║            [GUARD ROOM]                                   ║
║            4 shamblers, 1 elite shambler                  ║
║            Key to Floor 3 on elite                        ║
║                    ↓                                      ║
║            [STAIRWELL — Floor 3]                          ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════╗
║                   THE BARROW — FLOOR 3                    ║
║                    THE WARDEN'S KEEP                      ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  [STAIRWELL UP]═══════[ANTECHAMBER]                       ║
║                         4 wolf companions (dormant        ║
║                         unless aggro'd)                   ║
║                              ↓                           ║
║                    [THE WARDEN'S HALL]                    ║
║                                                           ║
║                    THE BARROW WARDEN                      ║
║                    (boss encounter)                        ║
║                    ← non-hostile if chapel offering done  ║
║                    ← gives lore + key if offered          ║
║                    ← fights if not                        ║
║                              ↓                           ║
║                    [TREASURE VAULT]                        ║
║                    Pre-Ashfall artifacts                   ║
║                    1 unique loot item (per character)      ║
║                    Tomb text: founding inscription         ║
║                              ↓                           ║
║                    [EXIT SEAL]                             ║
║                    One-way out, returns to West Ruins      ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

**The Barrow Warden — Boss Design**

Name: Unknown. His nameplate reads "The Warden." He has forgotten his actual name. He remembers his duty.

Appearance: A Stonekith elder, massive, wearing burial armor that has been maintained meticulously for a thousand years. No decay. No corruption. He has not been touched by Pyrevast's ash — the deep ward-seals of the Barrow have held. He is, in a sense, perfectly preserved.

He is also very, very tired.

Non-combat dialog (if Chapel offering was made):
```
"You have come a long way.

Not many do. Most who try the Barrow die on the 
second floor. The shamblers catch them in the 
Hall of Names.

[He sits down, slowly, with the deliberateness 
of someone whose joints have not been used in 
a long time]

I am the Warden of this Barrow. I was appointed 
in Year 12 Before. The appointment was for life.

[He looks at his hands]

It has been a long appointment.

What do you want to know?"
```

Available questions (branch dialog, future implementation):
- *"Who is buried here?"* → Extensive lore on the pre-Ashfall families, the history of the settlement, the lives of the dead
- *"What happened when the Ashfall came?"* → First-person account of a Stonekith experiencing the Ashfall from underground
- *"What is moving through the walls?"* → His answer is careful. Something has been moving through the walls for approximately forty years. He does not know what it is. He does not believe it is malevolent. He believes it is looking for something.
- *"Can you leave?"* → A long pause. *"I was appointed for life. I have not found the boundary of my appointment."*

Combat form (if no offering, or if player attacks):
Phase 1: Standard heavy melee. Slow, massive hits. High armor. Calls wolf companions.
Phase 2 (below 50%): Activates a ward-seal in the floor. Area denial mechanic — burning holy light zones that must be avoided while fighting.
Phase 3 (below 25%): The armor breaks. He is smaller beneath it than he appeared. He fights harder. *"I have not failed in a thousand years. I will not fail today."*

Loot: The Warden's Oath (unique ring — when below 30% HP, damage reduced by 25% and cannot be stunned). Tomb Key (opens the vault). Lore Fragment 1 of the Divine Contract.

---

### NPC Patrol Routes

#### Hub District — Civilian Routes

The hub has 6 unnamed civilian NPCs with fixed patrol routes. They create the sense of a living community without requiring dialog.

```
NPC A — "The Supply Runner"
Route: Depot → Market → Storehouse → Depot (120s loop)
Speed: Brisk walk
Notes: Carries crates. Occasionally stops to check a list.

NPC B — "The Warden Patrol"
Route: North Gate → East wall → South Gate → West wall → repeat
Speed: Measured march pace
Notes: Armed. Checks each gate for 8s before moving on.

NPC C/D — "The Two Workers"
Route: Courtyard → random adjacent building → courtyard (together)
Speed: Normal walk
Notes: Talk to each other (animation only — no text). Eat lunch at the fire at noon.

NPC E — "Old Marta" (Irongrip, unnamed in world)
Route: Cinder Tap → Market (once per morning) → Cinder Tap (stays)
Speed: Slow, deliberate
Notes: Only NPC who does not return greeting. She is always busy.

NPC F — "The Watcher"
Route: None. Sits on the roof of the Storehouse.
Speed: N/A
Notes: Looking east. Has been there every day the outpost has been occupied. 
       Nobody knows who they are or how they get onto the roof.
       If approached (requires climbing mechanic, future): empty space. 
       They were there. They are not anymore.
```

---

## PART FOUR: WORLD EVENTS — FULL DESIGN

### The Ember Storm — Complete Specification

**Trigger**: Every 45 minutes real time (adjustable in future settings). Announced 60 seconds in advance by a visual warning — the sky tint shifts amber, crystals begin to pulse faster.

**Duration**: 5 minutes.

**Phase 1 — Rising (0:00–1:30)**
- Crystal glow intensity increases gradually
- All ember-element enemies gain Empowered status (+20% damage, +15% HP)
- Ambient particle density increases (more ember particles visible on screen)
- Sound design: rising hum (future audio)

**Phase 2 — Storm (1:30–3:30)**
- Full Storm effects active
- Additional elite enemy spawn at 2 random locations outside hub
- All player abilities with fire or shard components: +30% effectiveness
- Ashborn racial: Shard Resonance range doubled
- Environmental hazard: standing in open ground (no tile cover within 4 tiles) applies Singed debuff (5 fire damage per second, cosmetic — the ash is hotter)
- Any Wandering Shard fragments visible in zone: orbit the nearest fixed crystal rather than drifting

**Phase 3 — Fading (3:30–5:00)**
- Effects reduce
- Empowered status fades from enemies (non-combat enemies return to normal; enemies in combat with the player retain it until end of combat)
- Crystals return to base glow

**Reward Structure**:
- Elite enemies spawned during Storm: +50% XP, doubled loot chance
- Crystal deposits: can be "harvested" during Phase 2 for Ember-grade shard fragments (the brief window of maximum excitation makes them easier to chip off)
- Completion passive: 10 minutes after the Storm, all enemies in zone are slightly weaker than baseline (post-storm drain effect) — the optimal farming window

### The Shambler Tide — Complete Specification

**Trigger**: Every 20 minutes real time. Announced by a low groaning sound (future audio) and a status notification: *"Shambler movement detected from the south."*

**Duration**: Until the wave is cleared or 3 minutes of no combat.

**Wave Composition**:
- Wave 1 (immediate): 4 Shamblers from south gate
- Wave 2 (90 seconds after Wave 1 is cleared): 6 Shamblers + 1 Elite variant
- Wave 3 (if player is Warden Honored+): Commander Shambler — the wave leader, a shambler carrying a broken Warden shield. Boss-lite encounter. Drops Shambler Commander armor piece (unique, heavy armor).

**Civilian Behavior During Tide**:
- All civilian NPCs retreat to indoor positions
- Sera Flint moves to the north side of the Depot (she has a crossbow she does not usually carry)
- Captain Rosk (when implemented): takes a position at the south gate, fighting alongside the player
- Marta Irongrip: does not move. Stands behind the Cinder Tap bar. Has a hammer.

**If Player Does Not Engage**:
- Waves reach the hub courtyard after 90 seconds
- Courtyard NPCs temporarily disabled (retreat indoors)
- Market stalls closed until wave cleared
- Communal fire extinguished (cannot be re-lit until after tide ends)
- NPCs resume normal behavior within 2 minutes of tide end

**Lore Beat**: After the third successful Tide defense in a session, Sera Flint has a new dialog line available:
```
"Third time this week. 

I used to think if we could just clear the marsh 
completely, they'd stop coming. But they keep 
coming from the same direction, same route, same 
numbers. Every time.

It's like something is organizing them. Or 
something is driving them. I don't know which 
is worse."
```

### The Wandering Shard — Complete Specification

**Trigger**: Random. Approximately once per 20 minutes. Can overlap with other events.

**Behavior**: A small amber light (particle cluster, no hitbox) drifts in from the map edge at random and follows a curved path through the zone. It pauses for 3-8 seconds at locations with existing shard formations before continuing.

**Interaction**: Player approaches within 4 tiles, presses E. Shard resolves into a lore item in the inventory (random from a pool of 40 Lore Fragment items). Light disappears.

**If Not Collected**: After 3 minutes, the light drifts off the map edge. The lore fragment from this visit is marked as "missed" and will not appear again this session (but may appear in future sessions — the pool rotates).

**Lore Fragment Pool — Sample Entries**:

*Fragment: "A child's question, answered"*
```
"My daughter asked me once why the ash glows at 
night. I told her that it remembered being fire.

She asked if fire remembered being something else.

I didn't know what to say.

She was six years old. She asked better questions 
than most scholars I know."
        — Recovered letter, author unknown, Year 34 A.E.
```

*Fragment: "The Sprite Watcher's Notes"*
```
"Observation 7: Sprites do not appear to feed in 
the conventional sense. They absorb thermal energy 
from crystal formations.

Observation 12: They communicate. Not vocally. 
Light patterns, rapid, complex. Consistent across 
individuals — the same pattern produces the same 
response in other sprites every time.

Observation 19: They know I'm watching.

Observation 20: They're waiting for me to do 
something. I don't know what."
        — Emberclave field notes, researcher unnamed, 
          three months before disappearance
```

*Fragment: "What my grandmother said"*
```
"She was seventy years old when the Ashfall came.

She said the ash didn't fall the way snow falls — 
straight down, gentle. It fell sideways. Toward 
things. As if it was choosing where to land.

She said it found the things that were trying 
hardest to stay alive and landed on those first.

She said she saw a man run from it and it followed 
him specifically, past three people standing still.

She lived. He didn't. She never knew why."
        — Oral history, recorded Year 210 A.E.
```

---

## PART FIVE: WORLD STATE CHANGES

The world should feel like it responds to the player's actions. These are planned state changes — persistent alterations to the zone based on quest completion and milestones.

### Ashveil Outskirts State Changes

**After first_hunt completed**:
- Wolf spawn count in north forest reduced by 3 (permanent per save)
- Patrol NPC dialog: *"Easier going north lately. Don't know what changed."*
- Noticeboard update: "Wolf activity decreasing — thank whoever is responsible."

**After ember_threat completed**:
- Sprite spawn count in east fields reduced by 2
- Crucible researcher NPC spawns in east fields (non-hostile, gives Emberclave lore)

**After the_veil_station completed** (future):
- West Ruins become partially accessible — the Veil Station is no longer sealed
- Ward-seal south gate upgraded: Shambler Tide reduced from 4 shamblers to 3 in Wave 1
- Ashford sends a follow-up message (starts letter chain)

**After The Barrow cleared** (future):
- The Barrow Gate becomes a fast-travel point (one-way: Barrow to West Ruins)
- Old Dram gets a new dialog tree — he has "heard" what the player found in there
- A small group of Rememberers appears in the West Ruins (ambient, non-hostile) — released from the Barrow by the clearing

**After first Shambler Tide defended 5 times**:
- Captain Rosk adds a bounty for the Tide Coordinator (elite shambler variant, future enemy)
- Flint upgrades the south gate (cosmetic change + minor defense bonus)

---

*End of WORLD.md additions — v1.1*
*Next expansion: Embersteppe detailed zone map, Thornwood hidden paths, Ironholt district layout*

## Ember Anchor
Position: (HX-1)*TS, (HY-2)*TS — northwest corner of Ashveil hub district
Description: A dense vertical shard formation that has accumulated over centuries at this
ley convergence point. The Wardens classify it as Anomaly-7 in their internal records.

Function: Acts as a binding/respawn point for shard-touched individuals who die within
its effective radius. The formation is large enough to "catch" and reconstitute fighters
who have absorbed trace shard energy through combat exposure in ash zones.

Lore significance: This is the primary reason Ashveil Outpost was established at this
location — not the defensible ridge, not the water source, but the anchor. Old Dram
documented its properties in Year 3 P.A. Captain Rosk uses it as a tactical resource.
The Ashborn Covenant considers it sacred. The Wardens pretend not to notice.

---

## Updates — v3.9 (2026-04-04)

### The Siltwood (new zone)

**Dimensions**: 80×60 tiles  
**Level range**: 5-8  
**Access**: East portal on Outskirts, Lv5+ and east_fields_survey complete  
**Tile palette**: Dark green-ash (near-black tree, murky path, green-tinted crystal, dark marsh)

The Siltwood is the eastern expansion of the Outskirts forest — crystallized by shard fallout during the Ashfall and now a single fused organism. Trees share root systems through crystal, the forest vibrates at low frequency, and everything that grows here has adapted to conduct shard energy.

**Entry point**: Emberclave camp (wx:3, wy:28 in zone coords)  
**Notable locations**:
- Emberclave camp (west clearing) — Auren's outpost
- Crystal field (east half, x>50) — Crystal-Grown territory
- Marsh lowlands (south, y>40) — Silt Shambler habitat
- The Pale Root (far east, wx:72×32) — stationary rare

**Lore objects**:
- Crystallized Tree Year 2048 — growth rings show normal wood, then single dark Ashfall band, then 17 years of crystal
- Hollow Crystal Tree — interior shape of a removed shard
- Root Exposure — fused root network; the Siltwood is one organism

**Enemies**: siltwood_stalker, crystal_grown, silt_shambler, grove_sentinel, pale_root (rare)

---

### Ashveil Warrens (new zone)

**Dimensions**: 64×48 tiles  
**Level range**: 6-12  
**Access**: West shaft (HX-22, HY+8 on Outskirts), Lv6+ and forge_contamination quest complete  
**Tile palette**: Near-black walls, dark stone floor, red-orange lava vein tiles

The Warrens were sealed in Year 2 P.A. after the Ashfall. The seal held for years. When Warden Tal Brennan went to check the shaft in Year 17 following a report of sounds from below, the seal was already broken. He went down to assess and never came back up.

The Covenant did not come through the shaft. They found another way, or someone let them in. Their altars in the lower level appear older than the Ashfall. They have been waiting for Pyrevast's process to complete.

**Layout**: 14 rooms across 2 levels
- Upper level (10 rooms): Entry chamber, guard post, collapse zone, warden's post, north tunnel end, lava vent chamber, warren hub, crawler nest, zealot shrine, deep access shaft
- Lower level (4 rooms): Sanctum antechamber, acolyte quarters, Archivist's study, Covenant Sanctum

**Lore objects**:
- Warden Tal Brennan's Final Post Log — trapped 6 days below; "I am writing this in case no one comes"
- Covenant Altar Inscription — "We are waiting for the process to complete. We are not impatient."
- Archivist Kalos's Study Notes — 536 trillion shard processing cycles since Ashfall; "I am afraid I do know."

**Enemies**: warren_crawler, lava_sprite, covenant_zealot, deep_shambler

---

### Veil Station Expansion (v3.9)

**Previous dimensions**: 48×36 tiles, 8 rooms  
**Current dimensions**: 64×48 tiles, 12 rooms across 2 levels

**Upper level** (y 2-22):
- R1: Entry hall
- R2: Warden barracks
- R3: Operations room (has veil_log_1)
- R4: North lab
- R5: Records room (has warden_report_veil)
- R6: Resonance array room

**Lower level** (y 24-44):
- R7-R11: Guard post → Generator → Containment → Architect chamber
- R12: Deep resonance core (has harlen_log and mira_entry)

**New lore objects**:
- Operations Log, Director H. Vane (Year 847 B.A.) — continuous resonance readings matching Consortium Survey 836; stops mid-sentence Day 292
- Warden Survey Year 12 P.A. — 340% signal increase since Year 3; seal request denied
- Director Vane's Private Log — "It is still thinking"
- Technician Vonn's Final Entry — stayed behind monitoring; "The frequency is not coming from the station. It is coming from everywhere."

**New enemies**: station_warden (patrol), resonance_specter (fast chaser), amplifier (stationary)
