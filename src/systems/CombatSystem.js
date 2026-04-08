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

    /** @type {object} Class abilities (loaded from class data at combat start) */
    this.abilities = {};
    this.classId = null;
    this.fury = 0;
    this.maxFury = 100;
    this.furyDecayTimer = 0;
    this.furyDecayDelay = 3000;
    this.furyDecayRate = 20;
    this.bleedTargets = []; // for Rend DoT tracking
  }

  togglePause() {
    this.paused = !this.paused;
    return this.paused;
  }

  useAbility(abilityKey) {
    if (!this.active || this.paused) return null;
    const ability = this.abilities[abilityKey];
    if (!ability || ability.currentCooldown > 0) return null;

    const stats = this.player.stats || this.player;
    const attack = stats.attack || 10;
    const maxHp = stats.maxHealth || 100;

    // Execute check — only usable on enemies below 30% HP
    if (abilityKey === 'execute' && this.enemy) {
      if (this.enemy.health > this.enemy.maxHealth * 0.3) return null;
    }

    ability.currentCooldown = ability.cooldown;

    switch (abilityKey) {
      case 'cleave': {
        let cleaveMult = 1.5;
        const bladeFlurryRank = this._talentRank('blade_flurry');
        if (bladeFlurryRank > 0) cleaveMult += bladeFlurryRank * 0.03;
        const damage = Math.round(attack * cleaveMult);
        if (this.enemy) this.enemy.health -= damage;
        // Warlord: Rallying Cry — Cleave heals
        const rallyingRank = this._talentRank('rallying_cry');
        let healAmount = 0;
        if (rallyingRank > 0) {
          healAmount = Math.round(maxHp * rallyingRank * 0.01);
          this.player.health = Math.min(maxHp, (this.player.health || 0) + healAmount);
        }
        return { type: 'cleave', data: { damage, healAmount, enemyHealth: this.enemy ? Math.max(0, this.enemy.health) : 0 } };
      }
      case 'rend': {
        let bleedMult = 0.5;
        const deepWoundsRank = this._talentRank('deep_wounds');
        if (deepWoundsRank > 0) bleedMult += deepWoundsRank * 0.05;
        const totalBleedDmg = Math.round(attack * bleedMult);
        const tickDmg = Math.ceil(totalBleedDmg / 6);
        this.bleedTargets.push({ tickDamage: tickDmg, remainingTicks: 6, tickTimer: 0 });
        return { type: 'rend', data: { totalDamage: totalBleedDmg, duration: 6 } };
      }
      case 'execute': {
        const damage = Math.round(attack * 3);
        if (this.enemy) this.enemy.health -= damage;
        return { type: 'execute', data: { damage, enemyHealth: this.enemy ? Math.max(0, this.enemy.health) : 0 } };
      }
      case 'emberVial': {
        const healAmount = Math.round(maxHp * 0.30);
        this.player.health = Math.min(maxHp, (this.player.health || 0) + healAmount);
        return { type: 'emberVial', data: { healAmount, newHealth: this.player.health } };
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
  startCombat(player, zoneId, depth, classData = null) {
    this.player = player;
    this.zoneId = zoneId;
    this.depth = depth;
    this.active = true;
    this.playerAttackTimer = 0;
    this.enemyAttackTimer = 0;
    this.zoneModifiers = getZoneModifiers(zoneId);
    this.enemy = this.spawnEnemy(depth);

    // Initialize class abilities
    this.fury = 0;
    this.bleedTargets = [];
    if (classData) {
      this.classData = classData;
      this.maxFury = classData.resource?.max || 100;
      this.furyDecayRate = classData.resource?.decay || 20;
      this.furyDecayDelay = classData.resource?.decayDelay || 3000;
      this.abilities = {};
      for (const ab of classData.abilities) {
        this.abilities[ab.key] = {
          ...ab,
          currentCooldown: 0,
          charges: 0,
        };
      }
      // Add universal Ember Vial heal (available to all classes)
      this.abilities.emberVial = {
        key: 'emberVial', name: 'Ember Vial', icon: '🧪', hotkey: 'R',
        cooldown: 15000, currentCooldown: 0, furyCost: 0,
        description: 'Restore 30% of max HP.\nAvailable to all classes.', color: 0x60a5fa,
      };
    }

    // Reset ability cooldowns
    for (const ability of Object.values(this.abilities)) {
      ability.currentCooldown = 0;
    }
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
  /**
   * Get the number of points allocated to a talent.
   */
  _talentRank(talentId) {
    return (this.player && this.player.talentPoints && this.player.talentPoints[talentId]) || 0;
  }

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

    // === Talent bonuses ===
    // Berserker: Rampage (+3% attack per rank)
    const rampageRank = this._talentRank('rampage');
    if (rampageRank > 0) damage *= 1 + rampageRank * 0.03;

    // Berserker: Deathwish (+3% damage per rank below 50% HP)
    const deathwishRank = this._talentRank('deathwish');
    if (deathwishRank > 0 && player.health < (stats.maxHealth || 100) * 0.5) {
      damage *= 1 + deathwishRank * 0.03;
    }

    // Berserker: Onslaught (+1% double-hit per rank)
    const onslaughtRank = this._talentRank('onslaught');
    if (onslaughtRank > 0 && Math.random() < onslaughtRank * 0.01) {
      damage *= 2; // double hit
    }

    // Crit roll
    let critChance = stats.critChance || 0.05;
    const surgicalRank = this._talentRank('surgical_strikes');
    if (surgicalRank > 0) critChance += surgicalRank * 0.01;

    let critDamage = stats.critDamage || 1.5;
    const endlessRageRank = this._talentRank('endless_rage');
    if (endlessRageRank > 0) critDamage += endlessRageRank * 0.02;

    const isCrit = Math.random() < critChance;
    if (isCrit) {
      damage *= critDamage;

      // Blademaster: Thousand Cuts (crits reduce cooldowns)
      const thousandCutsRank = this._talentRank('thousand_cuts');
      if (thousandCutsRank > 0) {
        const cdReduction = thousandCutsRank * 100; // 0.1s per rank in ms
        for (const ab of Object.values(this.abilities)) {
          if (ab.currentCooldown > 0) ab.currentCooldown = Math.max(0, ab.currentCooldown - cdReduction);
        }
      }
    }

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

    let rawDamage = enemy.damage * (this.enemyDamageMult || 1);

    // Boss charge mechanic: every 4th attack deals 2x damage
    if (enemy.isBoss) {
      enemy.attackCount = (enemy.attackCount || 0) + 1;
      if (enemy.attackCount % 4 === 0) {
        rawDamage *= 2;
      }
    }

    // === Talent defensive bonuses ===
    // Warlord: Iron Skin (+2% damage reduction per rank)
    const ironSkinRank = this._talentRank('iron_skin');
    if (ironSkinRank > 0) rawDamage *= (1 - ironSkinRank * 0.02);

    // Warlord: Commanding Presence (+1% defense per rank)
    let totalDefense = defense;
    const commandingRank = this._talentRank('commanding_presence');
    if (commandingRank > 0) totalDefense += commandingRank;

    // Blademaster: Riposte (+2% dodge per rank)
    const riposteRank = this._talentRank('riposte');
    if (riposteRank > 0 && Math.random() < riposteRank * 0.02) {
      return { damage: 0, dodged: true };
    }

    const damage = Math.max(1, Math.round(rawDamage) - totalDefense);
    player.health = Math.max(0, (player.health || 0) - damage);

    // Warlord: Last Stand (lifesteal below 30% HP)
    const lastStandRank = this._talentRank('last_stand');
    if (lastStandRank > 0 && player.health < (player.stats?.maxHealth || 100) * 0.3) {
      const heal = Math.round(damage * lastStandRank * 0.02);
      player.health = Math.min(player.stats?.maxHealth || 100, player.health + heal);
    }

    // Warlord: Undying (+2% max HP per rank — applied as bonus HP)
    // (This is a passive stat bonus, applied in Player.getComputedStats instead)

    return { damage, isCharged: enemy.isBoss && enemy.attackCount % 4 === 0, dodged: false };
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
   * Handle enemy death: emit events, drop loot, XP, spawn next enemy.
   * Returns array of events. Guards against double-processing.
   */
  _handleEnemyDeath(events) {
    if (!this.enemy || this.enemy._deathProcessed) return;
    this.enemy._deathProcessed = true;

    const gold = this.enemy.goldReward;
    events.push({ type: 'enemyDeath', data: { enemyName: this.enemy.name, gold, isElite: this.enemy.isElite, isBoss: this.enemy.isBoss || false } });

    const dropChance = (this.enemy.isElite || this.enemy.isBoss) ? ELITE_LOOT_DROP_CHANCE : LOOT_DROP_CHANCE;
    if (Math.random() < dropChance) {
      events.push({ type: 'lootDrop', data: { item: this.dropLoot(this.depth) } });
    }

    if (this.player.xp !== undefined && this.player.xpToLevel !== undefined) {
      const xpGained = 10 + this.depth * 2;
      this.player.xp += xpGained;
      if (this.player.xp >= this.player.xpToLevel) {
        this.player.xp -= this.player.xpToLevel;
        this.player.level = (this.player.level || 1) + 1;
        this.player.xpToLevel = Math.round(this.player.xpToLevel * 1.15);
        events.push({ type: 'levelUp', data: { newLevel: this.player.level } });
      }
    }

    this.bleedTargets = [];
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

    // Process bleed DoTs
    for (let i = this.bleedTargets.length - 1; i >= 0; i--) {
      const bleed = this.bleedTargets[i];
      bleed.tickTimer += deltaMs;
      if (bleed.tickTimer >= 1000) {
        bleed.tickTimer -= 1000;
        bleed.remainingTicks--;
        if (this.enemy && this.enemy.health > 0) {
          this.enemy.health -= bleed.tickDamage;
          events.push({ type: 'bleedTick', data: { damage: bleed.tickDamage } });

          if (this.enemy.health <= 0) {
            this._handleEnemyDeath(events);
            break;
          }
        }
        if (bleed.remainingTicks <= 0) {
          this.bleedTargets.splice(i, 1);
        }
      }
    }

    // --- Handle enemy already dead (killed by ability or bleed) ---
    if (this.enemy && this.enemy.health <= 0) {
      this._handleEnemyDeath(events);
      return events;
    }
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
        this._handleEnemyDeath(events);
        break;
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
