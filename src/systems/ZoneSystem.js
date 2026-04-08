import { ZONES } from '../data/constants.js';

/**
 * Zone-specific elemental modifiers.
 * Each zone grants offensive bonuses and/or requires resistances.
 */
const ZONE_MODIFIERS = {
  crypt: {
    name: 'Neutral',
    offensiveBonus: {},
    resistanceNeeded: {},
    description: 'No elemental bias',
  },
  ruins: {
    name: 'Fire Attuned',
    offensiveBonus: { fireDamage: 0.15 },
    resistanceNeeded: {},
    description: 'Fire damage increased by 15%',
  },
  volcano: {
    name: 'Volcanic',
    offensiveBonus: { fireDamage: 0.10 },
    resistanceNeeded: { fireResist: 0.20 },
    description: 'Enemies deal fire damage; fire resist recommended',
  },
  glacier: {
    name: 'Frozen',
    offensiveBonus: { iceDamage: 0.15 },
    resistanceNeeded: { iceResist: 0.15 },
    description: 'Ice-themed enemies; ice damage boosted',
  },
  void: {
    name: 'Chaotic',
    offensiveBonus: { fireDamage: 0.10, iceDamage: 0.10, poisonDamage: 0.10 },
    resistanceNeeded: { fireResist: 0.10, iceResist: 0.10, poisonResist: 0.10 },
    description: 'All elements present; all damage boosted and resisted',
  },
};

/**
 * Thematic enemy names by zone.
 */
const ZONE_ENEMY_NAMES = {
  crypt: [
    'Skeleton Warrior', 'Restless Ghost', 'Bone Archer',
    'Crypt Stalker', 'Tomb Guardian', 'Wraith',
    'Rotting Corpse', 'Death Knight',
  ],
  ruins: [
    'Sand Golem', 'Ruin Sentinel', 'Stone Gargoyle',
    'Fire Imp', 'Ancient Construct', 'Ember Wraith',
    'Flame Cultist', 'Lava Crawler',
  ],
  volcano: [
    'Magma Elemental', 'Inferno Drake', 'Obsidian Golem',
    'Flame Serpent', 'Volcanic Fiend', 'Molten Horror',
    'Fire Giant', 'Cinder Beast',
  ],
  glacier: [
    'Frost Revenant', 'Ice Elemental', 'Snow Troll',
    'Frozen Archer', 'Glacial Behemoth', 'Rime Specter',
    'Blizzard Wolf', 'Crystal Golem',
  ],
  void: [
    'Void Walker', 'Shadow Fiend', 'Abyssal Terror',
    'Chaos Spawn', 'Dark Watcher', 'Null Wraith',
    'Entropy Beast', 'Dimensional Horror',
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
  return ZONE_MODIFIERS[zoneId] || ZONE_MODIFIERS.crypt;
}

/**
 * Get thematic enemy names for a specific zone.
 * @param {string} zoneId - The zone identifier
 * @returns {string[]} Array of enemy name strings
 */
export function getEnemyNames(zoneId) {
  return ZONE_ENEMY_NAMES[zoneId] || ZONE_ENEMY_NAMES.crypt;
}
