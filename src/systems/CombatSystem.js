import {
  BASE_ENEMY_HEALTH,
  BASE_ENEMY_DAMAGE,
  BASE_ENEMY_GOLD,
  ENEMY_HEALTH_SCALE,
  ENEMY_DAMAGE_SCALE,
  RARITY,
  LOOT_DROP_CHANCE,
  ELITE_LOOT_DROP_CHANCE,
} from '../data/constants.js';
import { generateItem, rollRarity } from './LootSystem.js';
import { getEnemyNames, getZoneModifiers } from './ZoneSystem.js';

const BOSS_NAMES = {
  ashveil: ['The Barrow Warden', 'Threefang Alpha', "Maren's Shade", 'The Deepest Shambler'],
  embersteppe: ['The Breach Sentinel', 'Forge Golem Prime', 'The Recombined', "Archon's Shadow"],
  thornwood: ['The Tainted Bloom', 'Hollow Sentinel Lord', 'The Archivist', 'Overgrowth Titan'],
  ironholt: ['Rogue Overseer', 'The Iron Revenant King', 'Acid Drake Matriarch', 'Deepvein Colossus'],
  scarred_ring: ['Obsidian Warlord', 'The Molten Heart', 'Revenant Captain', 'Shard Colossus Prime'],
  ashen_maw: ["Pyrevast's Echo", 'The Bound Eternal', 'Maw Guardian Prime', 'Fragment of the Dreaming God'],
};

const BOSS_DEPTH_INTERVAL = 15;

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
    this.zoneId = 'ashveil';
    /** @type {number} Current depth in the zone */
    this.depth = 0;
    /** @type {boolean} Whether combat is active */
    this.active = false;
    /** @type {boolean} Whether combat is paused */
    this.paused = false;
    /** @type {number} External enemy damage multiplier (e.g., Ember Storm) */
    this.enemyDamageMult = 1;
    /** @type {number} Accumulated time since last player attack (ms) */
    this.playerAttackTimer = 0;
    /** @type {number} Accumulated time since last enemy attack (ms) */
    this.enemyAttackTimer = 0;
    /** @type {object} Zone modifiers cached for the active zone */
    this.zoneModifiers = {};
    /** @type {number} Tracks the depth at which a boss was already spawned */
    this.bossSpawnedAtDepth = -1;

    /** @type {object} Shard Power abilities */
    this.abilities = {
      shardBurst: { cooldown: 8000, currentCooldown: 0, name: 'Shard Burst' },
      threshWard: { cooldown: 15000, currentCooldown: 0, name: "Thresh's Ward", charges: 0 },
      emberHeal: { cooldown: 12000, currentCooldown: 0, name: 'Ember Heal' },
    };
  }

  togglePause() {
    this.paused = !this.paused;
    return this.paused;
  }

  useAbility(abilityKey) {
    if (!this.active || this.paused) return null;
    const ability = this.abilities[abilityKey];
    if (!ability || ability.currentCooldown > 0) return null;

    ability.currentCooldown = ability.cooldown;
    const stats = this.player.stats || this.player;

    switch (abilityKey) {
      case 'shardBurst': {
        const damage = Math.round((stats.attack || 10) * 2);
        if (this.enemy) {
          this.enemy.health -= damage;
        }
        return { type: 'shardBurst', data: { damage, enemyHealth: this.enemy ? Math.max(0, this.enemy.health) : 0 } };
      }
      case 'threshWard': {
        this.abilities.threshWard.charges = 3;
        return { type: 'threshWard', data: { charges: 3 } };
      }
      case 'emberHeal': {
        const maxHp = stats.maxHealth || 100;
        const healAmount = Math.round(maxHp * 0.35);
        this.player.health = Math.min(maxHp, (this.player.health || 0) + healAmount);
        return { type: 'emberHeal', data: { healAmount, newHealth: this.player.health } };
      }
      default:
        return null;
    }
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

    // Reset abilities
    for (const ability of Object.values(this.abilities)) {
      ability.currentCooldown = 0;
    }
    if (this.abilities.threshWard) this.abilities.threshWard.charges = 0;

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
   * Create a boss enemy with greatly amplified stats.
   * Bosses have 8x health, 1.5x damage, 3x gold, and a charge mechanic.
   * @param {number} depth - Current depth
   * @returns {object} Boss enemy object
   */
  spawnBoss(depth) {
    const names = BOSS_NAMES[this.zoneId] || BOSS_NAMES.ashveil;
    const bossName = pick(names);

    const healthScale = Math.pow(ENEMY_HEALTH_SCALE, depth);
    const damageScale = Math.pow(ENEMY_DAMAGE_SCALE, depth);

    const health = Math.round(BASE_ENEMY_HEALTH * healthScale * 8);
    const damage = Math.round(BASE_ENEMY_DAMAGE * damageScale * 1.5);
    const gold = Math.round(BASE_ENEMY_GOLD * (1 + depth * 0.15) * 3);

    return {
      name: bossName,
      health,
      maxHealth: health,
      damage,
      isElite: true,
      isBoss: true,
      goldReward: gold,
      attackCount: 0,
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
    // Check Thresh's Ward
    if (this.abilities.threshWard.charges > 0) {
      this.abilities.threshWard.charges--;
      return { damage: 0, blocked: true };
    }

    const stats = player.stats || player;
    const defense = stats.defense || 0;

    let rawDamage = enemy.damage * (this.enemyDamageMult || 1);

    // Boss charge mechanic: every 4th attack deals 2x damage
    if (enemy.isBoss) {
      enemy.attackCount = (enemy.attackCount || 0) + 1;
      if (enemy.attackCount % 4 === 0) {
        rawDamage *= 2;
      }
    }

    // Flat damage reduction: each point of defense removes 1 damage (min 1)
    const damage = Math.max(1, rawDamage - defense);
    player.health = Math.max(0, (player.health || 0) - damage);
    return { damage, isCharged: enemy.isBoss && enemy.attackCount % 4 === 0 };
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

    // Boss enemies get boosted drop rates (guaranteed epic+)
    if (this.enemy && this.enemy.isBoss) {
      return generateItem(playerLevel, this.zoneId, dropRateBonus + 0.50);
    }

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
    if (this.paused) return [];

    // Tick ability cooldowns
    for (const ability of Object.values(this.abilities)) {
      if (ability.currentCooldown > 0) {
        ability.currentCooldown = Math.max(0, ability.currentCooldown - deltaMs);
      }
    }

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
          data: { enemyName: this.enemy.name, gold, isElite: this.enemy.isElite, isBoss: this.enemy.isBoss || false },
        });

        // Drop loot (chance-based, elites/bosses always drop)
        const dropChance = (this.enemy.isElite || this.enemy.isBoss) ? ELITE_LOOT_DROP_CHANCE : LOOT_DROP_CHANCE;
        if (Math.random() < dropChance) {
          const loot = this.dropLoot(this.depth);
          events.push({
            type: 'lootDrop',
            data: { item: loot },
          });
        }

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

        // Check if we should spawn a boss at this depth
        const isBossDepth = this.depth > 0 && this.depth % BOSS_DEPTH_INTERVAL === 0;
        const bossNotYetSpawned = this.bossSpawnedAtDepth !== this.depth;
        if (isBossDepth && bossNotYetSpawned) {
          this.enemy = this.spawnBoss(this.depth);
          this.bossSpawnedAtDepth = this.depth;
        } else {
          this.enemy = this.spawnEnemy(this.depth);
        }
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
