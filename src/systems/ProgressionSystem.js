import { UPGRADE_TYPES, UPGRADE_CONFIG } from '../data/constants.js';

/**
 * Calculate the gold cost for an upgrade at a given level.
 * Cost = baseCost * costScale ^ currentLevel
 * @param {string} upgradeType - One of UPGRADE_TYPES values.
 * @param {number} currentLevel - The player's current level in this upgrade.
 * @returns {number} The gold cost, or Infinity if already at max level.
 */
export function getUpgradeCost(upgradeType, currentLevel) {
  const config = UPGRADE_CONFIG[upgradeType];
  if (!config) return Infinity;
  if (currentLevel >= config.maxLevel) return Infinity;
  return Math.floor(config.baseCost * Math.pow(config.costScale, currentLevel));
}

/**
 * Check whether the player can afford an upgrade.
 * @param {string} upgradeType
 * @param {number} currentLevel
 * @param {number} gold - The player's current gold.
 * @returns {boolean}
 */
export function canAffordUpgrade(upgradeType, currentLevel, gold) {
  const cost = getUpgradeCost(upgradeType, currentLevel);
  return gold >= cost;
}

/**
 * Apply an upgrade to the player: deduct gold, increment upgrade level,
 * and recalculate base stats.
 * @param {import('../models/Player.js').Player} player
 * @param {string} upgradeType
 * @returns {boolean} True if the upgrade was applied, false if it couldn't be.
 */
export function applyUpgrade(player, upgradeType) {
  const config = UPGRADE_CONFIG[upgradeType];
  if (!config) return false;

  const currentLevel = player.upgrades[upgradeType] || 0;
  if (currentLevel >= config.maxLevel) return false;

  const cost = getUpgradeCost(upgradeType, currentLevel);
  if (player.gold < cost) return false;

  player.gold -= cost;
  player.upgrades[upgradeType] = currentLevel + 1;

  // Recalculate base stats with the new upgrade level
  player._applyUpgradeBonuses();

  return true;
}

/**
 * Get the total bonus value provided by an upgrade at a given level.
 * @param {string} upgradeType
 * @param {number} level
 * @returns {number}
 */
export function getUpgradeValue(upgradeType, level) {
  const config = UPGRADE_CONFIG[upgradeType];
  if (!config) return 0;
  return config.baseValue * level;
}

/**
 * Get what the next level of an upgrade would provide (the incremental value).
 * @param {string} upgradeType
 * @param {number} currentLevel
 * @returns {number} The value of the next level, or 0 if already maxed.
 */
export function getNextUpgradeValue(upgradeType, currentLevel) {
  const config = UPGRADE_CONFIG[upgradeType];
  if (!config) return 0;
  if (currentLevel >= config.maxLevel) return 0;
  return config.baseValue;
}

/**
 * Get an overview of all available upgrades for UI display.
 * @param {import('../models/Player.js').Player} player
 * @returns {Array<Object>} Array of { type, label, currentLevel, maxLevel, cost, currentValue, nextValue, canAfford }
 */
export function getAllUpgrades(player) {
  const result = [];

  for (const [key, type] of Object.entries(UPGRADE_TYPES)) {
    const config = UPGRADE_CONFIG[type];
    if (!config) continue;

    const currentLevel = player.upgrades[type] || 0;
    const cost = getUpgradeCost(type, currentLevel);

    result.push({
      type,
      label: config.label,
      currentLevel,
      maxLevel: config.maxLevel,
      cost: currentLevel >= config.maxLevel ? null : cost,
      currentValue: getUpgradeValue(type, currentLevel),
      nextValue: getNextUpgradeValue(type, currentLevel),
      canAfford: canAffordUpgrade(type, currentLevel, player.gold),
    });
  }

  return result;
}
