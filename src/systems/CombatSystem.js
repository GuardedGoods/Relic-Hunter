import {
  BASE_ENEMY_HEALTH,
  BASE_ENEMY_DAMAGE,
  BASE_ENEMY_GOLD,
  ENEMY_HEALTH_SCALE,
  ENEMY_DAMAGE_SCALE,
  RARITY,
} from '../data/constants.js';
import { generateItem, rollRarity } from './LootSystem.js';
import { getEnemyNames, getZoneModifiers } from './ZoneSystem.js';

/**
 * Pick a random element from an array.
 */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Auto-combat engine that processes timed combat ticks and emits events.
 */
export class CombatSystem {
  constructor() {
    /** @type {object|null} Reference to the player object */
    this.player = null;
    /** @type {object|null} Current enemy */
    this.enemy = null;
    /** @type {string} Active zone id */
    this.zoneId = 'crypt';
    /** @type {number} Current depth in the zone */
    this.depth = 0;
    /** @type {boolean} Whether combat is active */
    this.active = false;
    /** @type {number} Accumulated time since last player attack (ms) */
    this.playerAttackTimer = 0;
    /** @type {number} Accumulated time since last enemy attack (ms) */
    this.enemyAttackTimer = 0;
    /** @type {object} Zone modifiers cached for the active zone */
    this.zoneModifiers = {};
  }

  /**
   * Begin a combat run in the given zone at the given depth.
   * @param {object} player - Player state object (must have stats, level, etc.)
   * @param {string} zoneId - Zone identifier
   * @param {number} depth - Depth level to fight at
   */
  startCombat(player, zoneId, depth) {
    this.player = player;
    this.zoneId = zoneId;
    this.depth = depth;
    this.active = true;
    this.playerAttackTimer = 0;
    this.enemyAttackTimer = 0;
    this.zoneModifiers = getZoneModifiers(zoneId);
    this.enemy = this.spawnEnemy(depth);
  }

  /**
   * Create an enemy with stats scaled by depth.
   * 5% chance the enemy is elite (3x HP, 1.5x damage, 2x gold).
   * @param {number} depth - Current depth
   * @returns {object} Enemy object
   */
  spawnEnemy(depth) {
    const isElite = Math.random() < 0.05;
    const names = getEnemyNames(this.zoneId);
    const baseName = pick(names);

    const healthScale = Math.pow(ENEMY_HEALTH_SCALE, depth);
    const damageScale = Math.pow(ENEMY_DAMAGE_SCALE, depth);

    let health = Math.round(BASE_ENEMY_HEALTH * healthScale);
    let damage = Math.round(BASE_ENEMY_DAMAGE * damageScale);
    let gold = Math.round(BASE_ENEMY_GOLD * (1 + depth * 0.15));

    if (isElite) {
      health *= 3;
      damage = Math.round(damage * 1.5);
      gold *= 2;
    }

    return {
      name: isElite ? `Elite ${baseName}` : baseName,
      health,
      maxHealth: health,
      damage,
      isElite,
      goldReward: gold,
    };
  }

  /**
   * Calculate damage the player deals to an enemy, including crit, elemental,
   * and conditional modifiers.
   * @param {object} player - Player state
   * @param {object} enemy - Enemy target
   * @returns {{ damage: number, isCrit: boolean }}
   */
  calculateDamage(player, enemy) {
    const stats = player.stats || player;

    let damage = stats.attack || 0;

    // Elemental damage
    const fireDmg = stats.fireDamage || 0;
    const iceDmg = stats.iceDamage || 0;
    const poisonDmg = stats.poisonDamage || 0;

    // Apply zone offensive bonuses to elemental damage
    const bonus = this.zoneModifiers.offensiveBonus || {};
    damage += fireDmg * (1 + (bonus.fireDamage || 0));
    damage += iceDmg * (1 + (bonus.iceDamage || 0));
    damage += poisonDmg * (1 + (bonus.poisonDamage || 0));

    // Conditional: bonus damage vs elites
    if (enemy.isElite && stats.eliteDamage) {
      damage *= 1 + stats.eliteDamage / 100;
    }

    // Conditional: bonus damage when low HP
    if (stats.lowHpDamage && player.health < (stats.maxHealth || 100) * 0.5) {
      damage *= 1 + stats.lowHpDamage / 100;
    }

    // Crit roll
    const critChance = stats.critChance || 0.05;
    const critDamage = stats.critDamage || 1.5;
    const isCrit = Math.random() < critChance;
    if (isCrit) {
      damage *= critDamage;
    }

    // Subtract enemy "defense" if the concept is ever added (future-proof)
    damage = Math.max(1, Math.round(damage));

    return { damage, isCrit };
  }

  /**
   * Process an enemy attacking the player.
   * @param {object} enemy - Attacking enemy
   * @param {object} player - Defending player
   * @returns {{ damage: number }}
   */
  processEnemyAttack(enemy, player) {
    const stats = player.stats || player;
    const defense = stats.defense || 0;
    // Flat damage reduction: each point of defense removes 1 damage (min 1)
    const damage = Math.max(1, enemy.damage - defense);
    player.health = Math.max(0, (player.health || 0) - damage);
    return { damage };
  }

  /**
   * Generate loot when an enemy dies.
   * Elite enemies guarantee at least rare rarity.
   * @param {number} depth - Current depth
   * @returns {object} Generated item
   */
  dropLoot(depth) {
    const playerLevel = this.player.level || 1;
    const dropRateBonus = this.player.dropRateBonus || 0;
    const item = generateItem(playerLevel, this.zoneId, dropRateBonus);

    // For elite enemies, re-roll if below rare
    if (this.enemy && this.enemy.isElite) {
      const rarityIndex = [RARITY.COMMON, RARITY.UNCOMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY];
      if (rarityIndex.indexOf(item.rarity) < rarityIndex.indexOf(RARITY.RARE)) {
        return generateItem(playerLevel, this.zoneId, dropRateBonus + 0.30);
      }
    }

    return item;
  }

  /**
   * Main update loop. Call every frame with the elapsed delta in ms.
   * Returns an array of combat events that occurred during this tick.
   * @param {number} deltaMs - Milliseconds since last tick
   * @returns {Array<{ type: string, data: object }>} Events produced
   */
  tick(deltaMs) {
    if (!this.active || !this.player || !this.enemy) return [];

    const events = [];

    // --- Player attacks ---
    const attackInterval = 1000 / (this.player.stats?.attackSpeed || this.player.attackSpeed || 1);
    this.playerAttackTimer += deltaMs;

    while (this.playerAttackTimer >= attackInterval) {
      this.playerAttackTimer -= attackInterval;

      const { damage, isCrit } = this.calculateDamage(this.player, this.enemy);
      this.enemy.health -= damage;

      events.push({
        type: 'playerAttack',
        data: { damage, isCrit, enemyHealthRemaining: Math.max(0, this.enemy.health) },
      });

      // Check enemy death
      if (this.enemy.health <= 0) {
        const gold = this.enemy.goldReward;
        events.push({
          type: 'enemyDeath',
          data: { enemyName: this.enemy.name, gold, isElite: this.enemy.isElite },
        });

        // Drop loot
        const loot = this.dropLoot(this.depth);
        events.push({
          type: 'lootDrop',
          data: { item: loot },
        });

        // Check for level-up (simple XP: 10 + depth * 2 per kill)
        if (this.player.xp !== undefined && this.player.xpToLevel !== undefined) {
          const xpGained = 10 + this.depth * 2;
          this.player.xp += xpGained;
          if (this.player.xp >= this.player.xpToLevel) {
            this.player.xp -= this.player.xpToLevel;
            this.player.level = (this.player.level || 1) + 1;
            this.player.xpToLevel = Math.round(this.player.xpToLevel * 1.15);
            events.push({
              type: 'levelUp',
              data: { newLevel: this.player.level },
            });
          }
        }

        // Spawn next enemy
        this.enemy = this.spawnEnemy(this.depth);
        this.playerAttackTimer = 0;
        this.enemyAttackTimer = 0;
        break; // start fresh next tick
      }
    }

    // --- Enemy attacks ---
    const enemyAttackInterval = 1500; // fixed 1.5 s
    this.enemyAttackTimer += deltaMs;

    while (this.enemyAttackTimer >= enemyAttackInterval && this.enemy.health > 0) {
      this.enemyAttackTimer -= enemyAttackInterval;

      const { damage } = this.processEnemyAttack(this.enemy, this.player);

      events.push({
        type: 'enemyAttack',
        data: { damage, playerHealthRemaining: this.player.health },
      });

      if (this.player.health <= 0) {
        this.active = false;
        events.push({
          type: 'playerDeath',
          data: { killedBy: this.enemy.name, depth: this.depth },
        });
        break;
      }
    }

    return events;
  }
}
