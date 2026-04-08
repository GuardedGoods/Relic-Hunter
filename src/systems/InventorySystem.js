import { RARITY_ORDER, RARITY_CONFIG } from '../data/constants.js';
import { AFFIX_POOL } from '../data/affixes.js';

/**
 * Compare a new item against the currently equipped item, showing stat-by-stat differences.
 * @param {Object|null} currentItem - The currently equipped item (null if slot is empty).
 * @param {Object} newItem - The candidate item.
 * @param {Object} playerStats - The player's current computed stats (for context).
 * @returns {Object} { changes: [{stat, current, new, diff, better}], overallBetter: bool }
 */
export function compareItems(currentItem, newItem, playerStats) {
  const currentAffixes = _affixMap(currentItem);
  const newAffixes = _affixMap(newItem);

  // Collect all stat keys that appear in either item
  const allStats = new Set([...Object.keys(currentAffixes), ...Object.keys(newAffixes)]);

  const changes = [];
  let betterCount = 0;
  let worseCount = 0;

  for (const stat of allStats) {
    const currentVal = currentAffixes[stat] || 0;
    const newVal = newAffixes[stat] || 0;
    const diff = newVal - currentVal;

    const better = diff > 0;
    if (diff > 0) betterCount++;
    if (diff < 0) worseCount++;

    changes.push({
      stat,
      current: currentVal,
      new: newVal,
      diff,
      better,
    });
  }

  return {
    changes,
    overallBetter: betterCount > worseCount,
  };
}

/**
 * Build a map of stat -> total value from an item's affixes.
 * @param {Object|null} item
 * @returns {Object}
 */
function _affixMap(item) {
  const map = {};
  if (!item || !item.affixes) return map;
  for (const affix of item.affixes) {
    map[affix.stat] = (map[affix.stat] || 0) + affix.value;
  }
  return map;
}

/**
 * Calculate a simple numeric score for an item, useful for quick comparisons and sorting.
 * Score is based on the sum of each affix value normalized against its possible range,
 * weighted by the item's rarity multiplier.
 * @param {Object} item
 * @returns {number}
 */
export function getItemScore(item) {
  if (!item || !item.affixes) return 0;

  let score = 0;

  for (const affix of item.affixes) {
    const poolEntry = AFFIX_POOL.find(a => a.id === affix.id);
    if (poolEntry) {
      const [min, max] = poolEntry.range;
      const range = max - min;
      // Normalize to 0-1 within the affix's range, then scale
      const normalized = range > 0 ? (affix.value - min) / range : 1;
      score += normalized;
    } else {
      // Unknown affix; use raw value contribution
      score += affix.value / 10;
    }
  }

  // Weight by rarity
  const rarityConfig = RARITY_CONFIG[item.rarity];
  if (rarityConfig) {
    score *= rarityConfig.statMult;
  }

  return Math.round(score * 100) / 100;
}

/**
 * Format an affix's label by replacing {v} with its actual value.
 * @param {Object} affix - An affix object with label and value.
 * @returns {string}
 */
export function formatAffix(affix) {
  if (!affix || !affix.label) return '';
  return affix.label.replace('{v}', affix.value);
}

/**
 * Build structured tooltip data for an item.
 * @param {Object} item
 * @returns {Object} { name, rarity, slot, affixes: [formatted strings], score, setName? }
 */
export function getItemTooltip(item) {
  if (!item) return null;

  const tooltip = {
    name: item.name || 'Unknown Item',
    rarity: item.rarity,
    slot: item.slot,
    affixes: (item.affixes || []).map(affix => formatAffix(affix)),
    score: getItemScore(item),
  };

  if (item.setId) {
    tooltip.setName = item.setId;
  }

  return tooltip;
}

/**
 * Sort an inventory array by the given criteria.
 * @param {Array} inventory - Array of item objects.
 * @param {string} sortBy - One of: 'rarity', 'score', 'slot', 'name'.
 * @returns {Array} A new sorted array (does not mutate the original).
 */
export function sortInventory(inventory, sortBy = 'rarity') {
  const sorted = [...inventory];

  switch (sortBy) {
    case 'rarity':
      sorted.sort((a, b) => {
        const aIdx = RARITY_ORDER.indexOf(a.rarity);
        const bIdx = RARITY_ORDER.indexOf(b.rarity);
        // Higher rarity first
        return bIdx - aIdx;
      });
      break;

    case 'score':
      sorted.sort((a, b) => getItemScore(b) - getItemScore(a));
      break;

    case 'slot':
      sorted.sort((a, b) => {
        const slotOrder = ['weapon', 'helmet', 'chest', 'gloves', 'boots', 'ring'];
        return slotOrder.indexOf(a.slot) - slotOrder.indexOf(b.slot);
      });
      break;

    case 'name':
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      break;

    default:
      break;
  }

  return sorted;
}
