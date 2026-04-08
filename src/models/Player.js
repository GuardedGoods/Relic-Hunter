import { BASE_STATS, INVENTORY_SIZE, SLOT, UPGRADE_TYPES, UPGRADE_CONFIG, ITEM_SETS } from '../data/constants.js';

/**
 * Player model - holds all player state including stats, equipment, inventory,
 * gold, upgrades, and run progress.
 */
export class Player {
  constructor(saveData = null) {
    if (saveData) {
      this._loadFromSave(saveData);
    } else {
      this._createFresh();
    }
  }

  /** Initialize a brand-new player with default values. */
  _createFresh() {
    this.baseStats = { ...BASE_STATS };
    this.equipment = {
      [SLOT.WEAPON]: null,
      [SLOT.HELMET]: null,
      [SLOT.CHEST]: null,
      [SLOT.GLOVES]: null,
      [SLOT.BOOTS]: null,
      ring: null,
    };
    this.inventory = [];
    this.gold = 0;
    this.upgrades = {};
    for (const key of Object.values(UPGRADE_TYPES)) {
      this.upgrades[key] = 0;
    }
    this.maxDepthReached = 0;
    this.totalRuns = 0;
    this.currentHealth = this.baseStats.maxHealth;
  }

  /** Restore player state from a plain save-data object. */
  _loadFromSave(data) {
    this.baseStats = { ...BASE_STATS };
    this.upgrades = { ...data.upgrades };

    // Re-apply upgrade bonuses to base stats
    this._applyUpgradeBonuses();

    this.equipment = {
      [SLOT.WEAPON]: null,
      [SLOT.HELMET]: null,
      [SLOT.CHEST]: null,
      [SLOT.GLOVES]: null,
      [SLOT.BOOTS]: null,
      ring: null,
    };
    // Runs start fresh — no gear or inventory carries over
    this.inventory = [];
    this.gold = data.gold || 0;
    this.maxDepthReached = data.maxDepthReached || 0;
    this.totalRuns = data.totalRuns || 0;
    this.currentHealth = this.baseStats.maxHealth;
  }

  /** Apply all upgrade bonuses to baseStats. */
  _applyUpgradeBonuses() {
    // Reset to raw base before applying upgrades
    this.baseStats = { ...BASE_STATS };

    const healthLevel = this.upgrades[UPGRADE_TYPES.MAX_HEALTH] || 0;
    if (healthLevel > 0) {
      this.baseStats.maxHealth += UPGRADE_CONFIG[UPGRADE_TYPES.MAX_HEALTH].baseValue * healthLevel;
    }

    const attackLevel = this.upgrades[UPGRADE_TYPES.BASE_ATTACK] || 0;
    if (attackLevel > 0) {
      this.baseStats.attack += UPGRADE_CONFIG[UPGRADE_TYPES.BASE_ATTACK].baseValue * attackLevel;
    }

    const defenseLevel = this.upgrades[UPGRADE_TYPES.BASE_DEFENSE] || 0;
    if (defenseLevel > 0) {
      this.baseStats.defense += UPGRADE_CONFIG[UPGRADE_TYPES.BASE_DEFENSE].baseValue * defenseLevel;
    }
  }

  /**
   * Compute final stats by combining base stats, equipment affixes, and set bonuses.
   * Flat bonuses are summed first, then percent bonuses are applied multiplicatively.
   * @returns {Object} The fully computed stat block.
   */
  getComputedStats() {
    const flat = { ...this.baseStats };
    const percent = {};

    // Gather all equipped items
    const equippedItems = this._getEquippedItems();

    // Sum affixes from equipment
    for (const item of equippedItems) {
      if (!item.affixes) continue;
      for (const affix of item.affixes) {
        if (affix.type === 'flat' || affix.type === 'elemental') {
          flat[affix.stat] = (flat[affix.stat] || 0) + affix.value;
        } else if (affix.type === 'percent') {
          percent[affix.stat] = (percent[affix.stat] || 0) + affix.value;
        } else if (affix.type === 'conditional') {
          // Conditional stats stored separately for runtime checks
          flat[affix.stat] = (flat[affix.stat] || 0) + affix.value;
        }
      }
    }

    // Apply set bonuses
    const setBonuses = this._getSetBonuses(equippedItems);
    for (const bonus of setBonuses) {
      for (const [key, value] of Object.entries(bonus)) {
        if (key === 'label') continue;
        if (key.endsWith('Percent')) {
          const baseStat = key.replace('Percent', '');
          percent[baseStat] = (percent[baseStat] || 0) + value * 100;
        } else if (typeof value === 'number') {
          flat[key] = (flat[key] || 0) + value;
        } else if (typeof value === 'boolean' && value) {
          flat[key] = true;
        }
      }
    }

    // Apply percent bonuses to flat totals
    const computed = { ...flat };
    for (const [stat, pctValue] of Object.entries(percent)) {
      if (computed[stat] !== undefined && typeof computed[stat] === 'number') {
        computed[stat] = computed[stat] * (1 + pctValue / 100);
      } else {
        // For stats like attackSpeed that are already multiplier-based
        computed[stat] = (computed[stat] || 0) * (1 + pctValue / 100);
      }
    }

    // Include upgrade-derived meta bonuses (dropRate, goldGain) that don't map to combat stats
    const dropRateLevel = this.upgrades[UPGRADE_TYPES.DROP_RATE] || 0;
    if (dropRateLevel > 0) {
      computed.dropRateBonus = UPGRADE_CONFIG[UPGRADE_TYPES.DROP_RATE].baseValue * dropRateLevel;
    }

    const goldGainLevel = this.upgrades[UPGRADE_TYPES.GOLD_GAIN] || 0;
    if (goldGainLevel > 0) {
      computed.goldGainBonus = UPGRADE_CONFIG[UPGRADE_TYPES.GOLD_GAIN].baseValue * goldGainLevel;
    }

    // Apply talent bonuses to visible stats
    if (this.talentPoints) {
      const tp = this.talentPoints;
      // Berserker: Rampage (+3% attack per rank)
      if (tp.rampage) computed.attack *= (1 + tp.rampage * 0.03);
      // Berserker: Endless Rage (+2% crit damage per rank)
      if (tp.endless_rage) computed.critDamage += tp.endless_rage * 0.02;
      // Blademaster: Surgical Strikes (+1% crit chance per rank)
      if (tp.surgical_strikes) computed.critChance += tp.surgical_strikes * 0.01;
      // Blademaster: Riposte (+2% dodge per rank — store as stat)
      if (tp.riposte) computed.dodgeChance = (computed.dodgeChance || 0) + tp.riposte * 0.02;
      // Warlord: Undying (+2% max HP per rank)
      if (tp.undying) computed.maxHealth *= (1 + tp.undying * 0.02);
      // Warlord: Iron Skin (+2% damage reduction per rank — store as stat)
      if (tp.iron_skin) computed.damageReduction = (computed.damageReduction || 0) + tp.iron_skin * 0.02;
      // Warlord: Commanding Presence (+1 defense per rank)
      if (tp.commanding_presence) computed.defense += tp.commanding_presence;

      // Round display values
      computed.attack = Math.round(computed.attack);
      computed.maxHealth = Math.round(computed.maxHealth);
    }

    return computed;
  }

  /** Get all currently equipped items as an array (no nulls). */
  _getEquippedItems() {
    return Object.values(this.equipment).filter(item => item !== null);
  }

  /**
   * Determine which set bonuses are active based on equipped items.
   * @param {Array} equippedItems - Items currently equipped.
   * @returns {Array} Array of active bonus objects.
   */
  _getSetBonuses(equippedItems) {
    const activeBonuses = [];

    // Count equipped pieces per set
    const setCounts = {};
    for (const item of equippedItems) {
      if (item.setId) {
        setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
      }
    }

    // Check each set for threshold bonuses
    for (const [setId, count] of Object.entries(setCounts)) {
      const setDef = ITEM_SETS[setId];
      if (!setDef) continue;

      for (const [threshold, bonus] of Object.entries(setDef.bonuses)) {
        if (count >= Number(threshold)) {
          activeBonuses.push(bonus);
        }
      }
    }

    return activeBonuses;
  }

  /**
   * Equip an item to the appropriate slot.
   * For rings: fills ring1 first, then ring2; if both full, replaces ring1.
   * @param {Object} item - The item to equip.
   * @returns {Object|null} The previously equipped item, or null if the slot was empty.
   */
  equip(item) {
    if (!item || !item.slot) return null;

    if (item.slot === SLOT.RING) {
      const old = this.equipment.ring;
      this.equipment.ring = item;
      return old;
    }

    const old = this.equipment[item.slot];
    this.equipment[item.slot] = item;
    return old;
  }

  /**
   * Unequip an item from a given slot.
   * @param {string} slot - The equipment slot key (e.g. 'weapon', 'ring1', 'ring2').
   * @returns {Object|null} The unequipped item, or null if the slot was empty.
   */
  unequip(slot) {
    const item = this.equipment[slot] || null;
    this.equipment[slot] = null;
    return item;
  }

  /**
   * Add an item to the inventory.
   * @param {Object} item - The item to add.
   * @returns {boolean} True if the item was added, false if the inventory is full.
   */
  addToInventory(item) {
    if (this.isInventoryFull()) return false;
    this.inventory.push(item);
    return true;
  }

  /**
   * Remove an item from the inventory by its id.
   * @param {string} itemId - The id of the item to remove.
   */
  removeFromInventory(itemId) {
    const index = this.inventory.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.inventory.splice(index, 1);
    }
  }

  /**
   * Retrieve an item from inventory by id.
   * @param {string} itemId - The id of the item.
   * @returns {Object|undefined} The item, or undefined if not found.
   */
  getInventoryItem(itemId) {
    return this.inventory.find(item => item.id === itemId);
  }

  /**
   * Check whether the inventory is at capacity.
   * @returns {boolean}
   */
  isInventoryFull() {
    return this.inventory.length >= INVENTORY_SIZE;
  }

  /**
   * Heal the player by a given amount, capped at maxHealth.
   * @param {number} amount - HP to restore.
   */
  heal(amount) {
    const stats = this.getComputedStats();
    this.currentHealth = Math.min(this.currentHealth + amount, stats.maxHealth);
  }

  /**
   * Deal damage to the player, reduced by defense. Minimum 1 damage taken.
   * @param {number} amount - Raw incoming damage.
   * @returns {number} The actual damage dealt after defense.
   */
  takeDamage(amount) {
    const stats = this.getComputedStats();
    const damageTaken = Math.max(1, amount - stats.defense);
    this.currentHealth = Math.max(0, this.currentHealth - damageTaken);
    return damageTaken;
  }

  /**
   * Serialize player state to a plain object suitable for localStorage.
   * @returns {Object}
   */
  toSaveData() {
    return {
      equipment: { ...this.equipment },
      inventory: [...this.inventory],
      gold: this.gold,
      upgrades: { ...this.upgrades },
      maxDepthReached: this.maxDepthReached,
      totalRuns: this.totalRuns,
      currentHealth: this.currentHealth,
    };
  }

  /**
   * Create a Player instance from serialized save data.
   * @param {Object} data - Plain object from localStorage.
   * @returns {Player}
   */
  static fromSaveData(data) {
    return new Player(data);
  }
}
