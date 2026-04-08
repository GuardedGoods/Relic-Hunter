import { ZONES } from '../data/constants.js';

/**
 * Zone-specific elemental modifiers.
 * Each zone grants offensive bonuses and/or requires resistances.
 */
const ZONE_MODIFIERS = {
  ashveil: {
    name: 'Ash-Touched',
    offensiveBonus: {},
    resistanceNeeded: {},
    description: 'The scarred frontier. No elemental bias.',
  },
  embersteppe: {
    name: 'Volcanic Plains',
    offensiveBonus: { fireDamage: 0.15 },
    resistanceNeeded: { fireResist: 0.10 },
    description: 'Fire damage increased. Enemies deal fire damage.',
  },
  thornwood: {
    name: 'Corrupted Canopy',
    offensiveBonus: { poisonDamage: 0.15 },
    resistanceNeeded: {},
    description: 'Poison damage boosted by the Overgrowth.',
  },
  ironholt: {
    name: 'Industrial Depths',
    offensiveBonus: {},
    resistanceNeeded: { acidResist: 0.15 },
    description: 'Acid and smog hazards. Armor matters.',
  },
  scarred_ring: {
    name: 'Pyreclasm',
    offensiveBonus: { fireDamage: 0.10, iceDamage: 0.10 },
    resistanceNeeded: { fireResist: 0.20 },
    description: 'Extreme heat. All elements clash.',
  },
  ashen_maw: {
    name: 'Ground Zero',
    offensiveBonus: { fireDamage: 0.10, iceDamage: 0.10, poisonDamage: 0.10 },
    resistanceNeeded: { fireResist: 0.10, iceResist: 0.10, poisonResist: 0.10 },
    description: "Pyrevast's crater. All elements empowered.",
  },
  // Legacy fallbacks
  crypt: { name: 'Neutral', offensiveBonus: {}, resistanceNeeded: {}, description: 'No elemental bias' },
  ruins: { name: 'Fire Attuned', offensiveBonus: { fireDamage: 0.15 }, resistanceNeeded: {}, description: 'Fire damage increased by 15%' },
  volcano: { name: 'Volcanic', offensiveBonus: { fireDamage: 0.10 }, resistanceNeeded: { fireResist: 0.20 }, description: 'Fire resist recommended' },
  glacier: { name: 'Frozen', offensiveBonus: { iceDamage: 0.15 }, resistanceNeeded: { iceResist: 0.15 }, description: 'Ice themed' },
  void: { name: 'Chaotic', offensiveBonus: { fireDamage: 0.10, iceDamage: 0.10, poisonDamage: 0.10 }, resistanceNeeded: { fireResist: 0.10, iceResist: 0.10, poisonResist: 0.10 }, description: 'All elements' },
};

/**
 * Thematic enemy names by zone.
 */
const ZONE_ENEMY_NAMES = {
  ashveil: [
    'Ashen Wolf', 'Corrupted Shambler', 'Ember Sprite',
    'Ash Stalker', 'Restless Ghost', 'Bone Archer',
    'Blighted Scavenger', 'Grey Howler',
  ],
  embersteppe: [
    'Ember Wraith', 'Cinder Hound', 'Forge Golem',
    'The Empowered', 'Flame Cultist', 'Shard Sentinel',
    'Lava Crawler', 'Breach Experiment',
  ],
  thornwood: [
    'Ashroot', 'Blightwasp Swarm', 'The Taken',
    'Hollow Sentinel', 'Corrupted Stag', 'Vine Horror',
    'Overgrowth Tendril', 'Shadow Stalker',
  ],
  ironholt: [
    'Rogue Construct', 'Smog Crawler', 'Iron Revenant',
    'Acid Drake', 'Furnace Golem', 'Consortium Automaton',
    'Soot Wraith', 'Deepvein Horror',
  ],
  scarred_ring: [
    'Magma Elemental', 'Obsidian Golem', 'Flame Serpent',
    'Revenant', 'Lava Wurm', 'Shard Colossus',
    'Cinder Beast', 'Scorched Knight',
  ],
  ashen_maw: [
    'Void Walker', 'The Bound', 'Shard Wraith',
    "Pyrevast's Echo", 'Maw Guardian', 'Divine Fragment',
    'Entropy Beast', 'The Rememberer',
  ],
};

/**
 * Get all zones the player has unlocked based on their max depth reached.
 * @param {number} maxDepthReached - Highest depth the player has cleared
 * @returns {Array} Array of zone config objects that are unlocked
 */
export function getAvailableZones(maxDepthReached) {
  return ZONES.filter((zone) => maxDepthReached >= zone.unlockDepth);
}

/**
 * Get the elemental modifiers for a specific zone.
 * @param {string} zoneId - The zone identifier
 * @returns {object} Modifier object with offensiveBonus, resistanceNeeded, etc.
 */
export function getZoneModifiers(zoneId) {
  return ZONE_MODIFIERS[zoneId] || ZONE_MODIFIERS.ashveil;
}

/**
 * Get thematic enemy names for a specific zone.
 * @param {string} zoneId - The zone identifier
 * @returns {string[]} Array of enemy name strings
 */
export function getEnemyNames(zoneId) {
  return ZONE_ENEMY_NAMES[zoneId] || ZONE_ENEMY_NAMES.ashveil;
}
