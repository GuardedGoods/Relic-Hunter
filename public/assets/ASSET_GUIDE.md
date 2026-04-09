# Asset Guide — Relic Hunter

Drop image files into the folders below. The game will automatically use them
instead of procedural shapes when they exist.

## Directory Structure

```
public/assets/
├── sprites/          # Character & enemy sprites
│   ├── hero.png          # Player character (idle pose, ~120x160px recommended)
│   ├── hero-weapon.png   # Hero with weapon equipped (optional)
│   ├── hero-armor.png    # Hero with armor equipped (optional)
│   │
│   ├── enemy-wolf.png        # Beast-type enemies (Ashen Wolf, etc.)
│   ├── enemy-golem.png       # Golem-type enemies (Forge Golem, etc.)
│   ├── enemy-wraith.png      # Wraith-type enemies (floating, ghostly)
│   ├── enemy-undead.png      # Undead-type enemies (Shambler, Revenant)
│   ├── enemy-humanoid.png    # Generic humanoid enemies
│   ├── enemy-boss.png        # Boss enemies (larger, more menacing)
│   │
│   └── icons/                # Ability & slot icons (32x32px)
│       ├── cleave.png
│       ├── rend.png
│       ├── execute.png
│       ├── ember-vial.png
│       ├── slot-weapon.png
│       ├── slot-helmet.png
│       ├── slot-chest.png
│       ├── slot-gloves.png
│       ├── slot-boots.png
│       └── slot-ring.png
│
├── backgrounds/      # Zone backgrounds (860x720px, or tileable)
│   ├── ashveil.png       # Grey wasteland, dead trees, amber crystals
│   ├── embersteppe.png   # Volcanic plains, lava cracks, orange sky
│   ├── thornwood.png     # Dense dark canopy, green undergrowth
│   ├── ironholt.png      # Industrial, smokestacks, charcoal sky
│   ├── scarred-ring.png  # Obsidian spires, lava rivers, red sky
│   └── ashen-maw.png     # Crater glow, floating shards, near-black
│
├── ui/               # UI panel textures (optional)
│   ├── panel-bg.png      # Dark panel background (tileable or 9-slice)
│   ├── tooltip-bg.png    # Tooltip background
│   └── button-bg.png     # Button texture
│
└── icons/            # Item & rarity icons
    ├── rarity-common.png
    ├── rarity-uncommon.png
    ├── rarity-rare.png
    ├── rarity-epic.png
    └── rarity-legendary.png
```

## Image Specifications

### Character Sprites
- **Size**: 120x160px recommended (will be scaled in-game)
- **Format**: PNG with transparency
- **Style**: Dark fantasy pixel art or painted style
- **Background**: Transparent

### Enemy Sprites
- **Size**: 100-140px wide, proportional height
- **Variants needed**: At least the 5 body types (wolf, golem, wraith, undead, humanoid)
- **Boss variant**: Same sprite but ~1.4x larger, or a unique boss sprite

### Zone Backgrounds
- **Size**: 860x720px (exact canvas size) or larger (will be scaled to fit)
- **Style**: Atmospheric, dark, moody — should not distract from combat
- **Opacity**: Keep relatively dark so sprites stand out

### Ability Icons
- **Size**: 32x32px or 64x64px (will be scaled to fit hotbar slots)
- **Style**: Simple, readable at small sizes, dark background
- **Format**: PNG with transparency

## AI Image Generation Prompts

Use these prompts with DALL-E, Midjourney, or similar:

### Hero Sprite
"Dark fantasy pixel art character sprite, armored knight with green cape and
steel helmet, holding a sword, front-facing idle pose, transparent background,
120x160 pixels, retro game style"

### Enemy - Ashen Wolf
"Dark fantasy pixel art wolf monster, grey fur with glowing amber veins,
corrupted by ash magic, side profile, transparent background, 120x100 pixels"

### Enemy - Forge Golem
"Dark fantasy pixel art stone golem, massive body with glowing orange cracks,
small head, thick arms, front-facing, transparent background, 140x160 pixels"

### Enemy - Wraith
"Dark fantasy pixel art ghost wraith, floating translucent purple figure,
glowing green eyes, wispy ethereal body, no legs, transparent background,
100x140 pixels"

### Enemy - Boss
"Dark fantasy pixel art boss monster, massive corrupted knight with golden
glowing armor, red eyes, imposing pose, transparent background, 160x200 pixels"

### Zone Background - Ashveil Outskirts
"Dark fantasy game background, grey ash wasteland, dead white trees, small
amber crystal formations glowing, overcast sky, moody atmosphere, 860x720"

### Zone Background - Embersteppe
"Dark fantasy game background, volcanic black plains with orange lava cracks,
distant volcano with smoke, ember particles in air, dark orange sky, 860x720"

### Zone Background - Thornwood
"Dark fantasy game background, dense dark forest with massive tree trunks,
twilight canopy filtering dim green light, hanging vines, corrupted vegetation,
860x720"
