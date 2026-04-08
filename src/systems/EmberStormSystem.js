/**
 * Ember Storm System — periodic divine pulse events from the Ashen Maw.
 *
 * Every 7 depth levels, a pulse from the Maw empowers enemies but increases
 * loot quality. "The dream is trying to complete itself."
 *
 * Lore: Pyrevast's shattered consciousness sends signals outward every seven
 * days. Fragments calling to each other.
 */

const EMBER_STORM_DEPTH_INTERVAL = 7;
const EMBER_STORM_DURATION = 20000; // 20 seconds of empowered enemies
const EMBER_STORM_ENEMY_DAMAGE_MULT = 1.25; // +25% enemy damage
const EMBER_STORM_DROP_RATE_BONUS = 0.15; // +15% better drop rates
const EMBER_STORM_EXTRA_AFFIX_CHANCE = 0.40; // 40% chance for +1 affix on drops

export class EmberStormSystem {
  constructor() {
    /** @type {boolean} Whether a storm is currently active */
    this.active = false;
    /** @type {number} Remaining duration of current storm (ms) */
    this.remainingMs = 0;
    /** @type {number} Last depth a storm was triggered at */
    this.lastStormDepth = -1;
    /** @type {number} Total storms triggered this run */
    this.stormsTriggered = 0;
  }

  /**
   * Reset for a new run.
   */
  reset() {
    this.active = false;
    this.remainingMs = 0;
    this.lastStormDepth = -1;
    this.stormsTriggered = 0;
  }

  /**
   * Check if a storm should trigger at the given depth.
   * @param {number} depth - Current depth
   * @returns {boolean} True if a storm should start now
   */
  checkTrigger(depth) {
    if (depth <= 0) return false;
    if (depth % EMBER_STORM_DEPTH_INTERVAL !== 0) return false;
    if (this.lastStormDepth === depth) return false;
    if (this.active) return false;
    return true;
  }

  /**
   * Start an Ember Storm event.
   * @param {number} depth - Depth at which the storm triggered
   */
  startStorm(depth) {
    this.active = true;
    this.remainingMs = EMBER_STORM_DURATION;
    this.lastStormDepth = depth;
    this.stormsTriggered++;
  }

  /**
   * Update the storm timer. Call every frame.
   * @param {number} deltaMs - Frame delta in ms
   * @returns {boolean} True if the storm just ended this tick
   */
  tick(deltaMs) {
    if (!this.active) return false;
    this.remainingMs -= deltaMs;
    if (this.remainingMs <= 0) {
      this.active = false;
      this.remainingMs = 0;
      return true; // storm ended
    }
    return false;
  }

  /**
   * Get the enemy damage multiplier during an active storm.
   * @returns {number} Multiplier (1.0 if no storm, 1.25 during storm)
   */
  getEnemyDamageMult() {
    return this.active ? EMBER_STORM_ENEMY_DAMAGE_MULT : 1.0;
  }

  /**
   * Get the drop rate bonus during an active storm.
   * @returns {number} Bonus (0 if no storm, 0.15 during storm)
   */
  getDropRateBonus() {
    return this.active ? EMBER_STORM_DROP_RATE_BONUS : 0;
  }

  /**
   * Check if a dropped item should get a bonus affix during a storm.
   * @returns {boolean} True if the item should gain +1 affix
   */
  shouldAddBonusAffix() {
    return this.active && Math.random() < EMBER_STORM_EXTRA_AFFIX_CHANCE;
  }

  /**
   * Get progress toward next storm (for UI display).
   * @param {number} depth - Current depth
   * @returns {{ depthsUntilNext: number, isActive: boolean, remainingSeconds: number }}
   */
  getStatus(depth) {
    const depthsUntilNext = EMBER_STORM_DEPTH_INTERVAL - (depth % EMBER_STORM_DEPTH_INTERVAL);
    return {
      depthsUntilNext: depthsUntilNext === EMBER_STORM_DEPTH_INTERVAL ? 0 : depthsUntilNext,
      isActive: this.active,
      remainingSeconds: Math.ceil(this.remainingMs / 1000),
    };
  }
}
