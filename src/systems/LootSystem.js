import { RARITY, RARITY_ORDER, RARITY_CONFIG, SLOT, ALL_SLOTS, ITEM_SETS } from '../data/constants.js';
import { AFFIX_POOL, SLOT_AFFIX_WEIGHTS, NAME_PREFIXES, BASE_ITEM_NAMES } from '../data/affixes.js';

/**
 * Roll a rarity tier using weighted drop rates, adjusted by dropRateBonus.
 * The bonus shifts weight from common toward rarer tiers.
 * @param {number} dropRateBonus - Additive bonus (0 = base rates)
 * @returns {string} A RARITY value
 */
export function rollRarity(dropRateBonus = 0) {
  const weights = RARITY_ORDER.map((rarity) => {
    const base = RARITY_CONFIG[rarity].dropRate;
    if (rarity === RARITY.COMMON) {
      // Common absorbs the penalty so others can grow
      return Math.max(0.05, base - dropRateBonus);
    }
    // Rarer tiers get a proportional share of the bonus
    return base + dropRateBonus * (base / (1 - RARITY_CONFIG[RARITY.COMMON].dropRate));
  });

  const total = weights.reduce((s, w) => s + w, 0);
  let roll = Math.random() * total;

  for (let i = 0; i < RARITY_ORDER.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return RARITY_ORDER[i];
  }
  return RARITY.COMMON;
}

/**
 * Pick a random element from an array.
 */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Roll a numeric value within [min, max], scaled by rarity statMult and player level.
 */
function rollValue(min, max, statMult, playerLevel) {
  const levelScale = 1 + (playerLevel - 1) * 0.04; // +4% per level beyond 1
  const base = min + Math.random() * (max - min);
  return Math.ceil(base * statMult * levelScale);
}

/**
 * Select affixes for an item using weighted random selection (no duplicates).
 * @param {string} slot - The item slot
 * @param {number} count - Number of affixes to pick
 * @param {number} statMult - Rarity multiplier
 * @param {number} playerLevel - Current player level
 * @returns {Array} Array of resolved affix objects
 */
function selectAffixes(slot, count, statMult, playerLevel) {
  const weights = SLOT_AFFIX_WEIGHTS[slot] || {};
  const available = AFFIX_POOL.map((affix) => ({
    affix,
    weight: weights[affix.id] || 1,
  }));

  const selected = [];
  const used = new Set();

  for (let i = 0; i < count && available.length > used.size; i++) {
    const pool = available.filter((a) => !used.has(a.affix.id));
    const totalWeight = pool.reduce((s, a) => s + a.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const entry of pool) {
      roll -= entry.weight;
      if (roll <= 0) {
        used.add(entry.affix.id);
        const [min, max] = entry.affix.range;
        const value = rollValue(min, max, statMult, playerLevel);
        selected.push({
          id: entry.affix.id,
          label: entry.affix.label.replace('{v}', String(value)),
          stat: entry.affix.stat,
          type: entry.affix.type,
          value,
        });
        break;
      }
    }
  }

  return selected;
}

/**
 * Determine the thematic prefix category based on the affixes rolled.
 */
function getPrefixCategory(affixes) {
  for (const a of affixes) {
    if (a.stat === 'fireDamage') return 'fire';
    if (a.stat === 'iceDamage') return 'ice';
    if (a.stat === 'poisonDamage') return 'poison';
    if (a.stat === 'critChance' || a.stat === 'critDamage') return 'crit';
    if (a.stat === 'defense') return 'defense';
  }
  return 'neutral';
}

/**
 * Generate a thematic item name from prefix + base item name.
 */
function generateName(slot, affixes) {
  const category = getPrefixCategory(affixes);
  const prefixes = NAME_PREFIXES[category] || NAME_PREFIXES.neutral;
  const bases = BASE_ITEM_NAMES[slot] || ['Relic'];
  return `${pick(prefixes)} ${pick(bases)}`;
}

/**
 * Possibly assign a set ID to epic / legendary items.
 * Legendary: ~30% chance. Epic: ~10% chance.
 */
function rollSetId(rarity) {
  const setKeys = Object.keys(ITEM_SETS);
  if (rarity === RARITY.LEGENDARY && Math.random() < 0.30) {
    return pick(setKeys);
  }
  if (rarity === RARITY.EPIC && Math.random() < 0.10) {
    return pick(setKeys);
  }
  return null;
}

/**
 * Main item generation entry point.
 * @param {number} playerLevel - Player's current level
 * @param {string} zone - Zone ID (used to nudge depth bonus)
 * @param {number} [dropRateBonus=0] - Extra drop rate bonus
 * @returns {object} Generated item
 */
export function generateItem(playerLevel, zone, dropRateBonus = 0) {
  const rarity = rollRarity(dropRateBonus);
  const config = RARITY_CONFIG[rarity];

  // Pick a random equipment slot (ALL_SLOTS has ring twice for weighting)
  const slot = pick(ALL_SLOTS);

  const affixes = selectAffixes(slot, config.affixes, config.statMult, playerLevel);
  const name = generateName(slot, affixes);
  const setId = rollSetId(rarity);

  return {
    id: crypto.randomUUID(),
    name,
    slot,
    rarity,
    affixes,
    setId,
  };
}
