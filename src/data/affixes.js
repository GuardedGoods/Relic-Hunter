// Affix pool for procedural item generation
// Each affix has: id, label (display), stat (which stat it modifies), type (flat/percent/conditional/elemental), range [min, max]

export const AFFIX_POOL = [
  // Flat stats
  { id: 'flat_attack',     label: '+{v} Attack',            stat: 'attack',       type: 'flat',        range: [2, 20] },
  { id: 'flat_health',     label: '+{v} Health',            stat: 'maxHealth',    type: 'flat',        range: [5, 50] },
  { id: 'flat_defense',    label: '+{v} Defense',           stat: 'defense',      type: 'flat',        range: [1, 15] },

  // Scaling stats (percentage)
  { id: 'pct_attack_speed', label: '+{v}% Attack Speed',   stat: 'attackSpeed',  type: 'percent',     range: [3, 20] },
  { id: 'pct_crit_chance',  label: '+{v}% Crit Chance',    stat: 'critChance',   type: 'percent',     range: [1, 10] },
  { id: 'pct_crit_damage',  label: '+{v}% Crit Damage',    stat: 'critDamage',   type: 'percent',     range: [5, 30] },

  // Elemental
  { id: 'fire_damage',   label: '+{v} Fire Damage',        stat: 'fireDamage',   type: 'elemental',   range: [3, 25] },
  { id: 'ice_damage',    label: '+{v} Ice Damage',         stat: 'iceDamage',    type: 'elemental',   range: [3, 25] },
  { id: 'poison_damage', label: '+{v} Poison Damage',      stat: 'poisonDamage', type: 'elemental',   range: [3, 25] },

  // Conditional
  { id: 'low_hp_damage',   label: '+{v}% Dmg when < 50% HP', stat: 'lowHpDamage',   type: 'conditional', range: [5, 25] },
  { id: 'elite_damage',    label: '+{v}% Dmg vs Elites',     stat: 'eliteDamage',   type: 'conditional', range: [5, 30] },
  { id: 'gold_find',       label: '+{v}% Gold Find',         stat: 'goldFind',      type: 'conditional', range: [5, 25] },
];

// Slot-specific affix weights (some affixes are more likely on certain slots)
export const SLOT_AFFIX_WEIGHTS = {
  weapon:  { flat_attack: 3, pct_crit_chance: 2, pct_crit_damage: 2, fire_damage: 2, ice_damage: 2, poison_damage: 2, flat_health: 1, flat_defense: 1, pct_attack_speed: 2, low_hp_damage: 1, elite_damage: 1, gold_find: 1 },
  helmet:  { flat_health: 3, flat_defense: 2, pct_crit_chance: 1, flat_attack: 1, fire_damage: 1, ice_damage: 1, poison_damage: 1, pct_attack_speed: 1, pct_crit_damage: 1, low_hp_damage: 1, elite_damage: 1, gold_find: 2 },
  chest:   { flat_health: 3, flat_defense: 3, flat_attack: 1, pct_crit_chance: 1, fire_damage: 1, ice_damage: 1, poison_damage: 1, pct_attack_speed: 1, pct_crit_damage: 1, low_hp_damage: 1, elite_damage: 1, gold_find: 1 },
  gloves:  { pct_attack_speed: 3, pct_crit_chance: 3, pct_crit_damage: 2, flat_attack: 2, fire_damage: 1, ice_damage: 1, poison_damage: 1, flat_health: 1, flat_defense: 1, low_hp_damage: 1, elite_damage: 1, gold_find: 1 },
  boots:   { pct_attack_speed: 2, flat_defense: 2, flat_health: 2, gold_find: 3, flat_attack: 1, pct_crit_chance: 1, fire_damage: 1, ice_damage: 1, poison_damage: 1, pct_crit_damage: 1, low_hp_damage: 1, elite_damage: 1 },
  ring:    { pct_crit_chance: 2, pct_crit_damage: 2, fire_damage: 2, ice_damage: 2, poison_damage: 2, flat_attack: 2, flat_health: 1, flat_defense: 1, pct_attack_speed: 1, low_hp_damage: 2, elite_damage: 2, gold_find: 2 },
};

// Item name prefixes by element/theme
export const NAME_PREFIXES = {
  fire: ['Pyrevast\'s', 'Emberclave', 'Ashen', 'Molten', 'Forgeborn'],
  ice: ['Aeveth\'s', 'Stillwater', 'Frostbitten', 'Rimwall', 'Glacial'],
  poison: ['Solenne\'s', 'Blighted', 'Thornwatch', 'Overgrowth', 'Virulent'],
  crit: ['Vorryn\'s', 'Unmade', 'Keen', 'Ruthless', 'Entropy'],
  defense: ['Warden\'s', 'Irongrip', 'Stonekith', 'Copperhold', 'Bulwark'],
  neutral: ['Ancient', 'Runed', 'Sevenforge', 'Erethian', 'Ashfall'],
};

export const BASE_ITEM_NAMES = {
  weapon: ['Blade', 'Waraxe', 'Mace', 'Shard-Dagger', 'Ember Staff'],
  helmet: ['Ward-Helm', 'Crown', 'Veil Hood', 'Circlet', 'Visor'],
  chest: ['Veil Plate', 'Ashweave Robe', 'Forge Vest', 'Hauberk', 'Cuirass'],
  gloves: ['Gauntlets', 'Ward-Grips', 'Ember Wraps', 'Mitts', 'Bracers'],
  boots: ['Greaves', 'Ashwalkers', 'Sabatons', 'Thornwood Treads', 'Striders'],
  ring: ['Shard Ring', 'Ember Band', 'Veil Loop', 'Calmor Signet', 'Thresh Circle'],
};
