// === RARITY TIERS ===
export const RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
};

export const RARITY_ORDER = [RARITY.COMMON, RARITY.UNCOMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY];

export const RARITY_COLORS = {
  [RARITY.COMMON]: '#b0b0b0',
  [RARITY.UNCOMMON]: '#4ade80',
  [RARITY.RARE]: '#60a5fa',
  [RARITY.EPIC]: '#c084fc',
  [RARITY.LEGENDARY]: '#f97316',
};

export const RARITY_CONFIG = {
  [RARITY.COMMON]:    { affixes: 1, statMult: 1.0, dropRate: 0.60 },
  [RARITY.UNCOMMON]:  { affixes: 2, statMult: 1.2, dropRate: 0.25 },
  [RARITY.RARE]:      { affixes: 3, statMult: 1.5, dropRate: 0.10 },
  [RARITY.EPIC]:      { affixes: 4, statMult: 2.0, dropRate: 0.04 },
  [RARITY.LEGENDARY]: { affixes: 5, statMult: 2.8, dropRate: 0.01 },
};

// === ITEM SLOTS ===
export const SLOT = {
  WEAPON: 'weapon',
  HELMET: 'helmet',
  CHEST: 'chest',
  GLOVES: 'gloves',
  BOOTS: 'boots',
  RING: 'ring',
};

export const ALL_SLOTS = [SLOT.WEAPON, SLOT.HELMET, SLOT.CHEST, SLOT.GLOVES, SLOT.BOOTS, SLOT.RING, SLOT.RING];

// === PLAYER BASE STATS ===
export const BASE_STATS = {
  maxHealth: 100,
  attack: 10,
  defense: 5,
  attackSpeed: 1.0,
  critChance: 0.05,
  critDamage: 1.5,
  fireDamage: 0,
  iceDamage: 0,
  poisonDamage: 0,
};

// === INVENTORY ===
export const INVENTORY_SIZE = 20;
export const INVENTORY_COLS = 5;
export const INVENTORY_ROWS = 4;

// === LOOT DROP CHANCES ===
export const LOOT_DROP_CHANCE = 0.40; // 40% of kills drop loot (was 100%)
export const ELITE_LOOT_DROP_CHANCE = 1.0; // Elites always drop

// === ENEMY SCALING ===
export const ENEMY_HEALTH_SCALE = 1.08;  // +8% per level
export const ENEMY_DAMAGE_SCALE = 1.05;  // +5% per level
export const BASE_ENEMY_HEALTH = 30;
export const BASE_ENEMY_DAMAGE = 5;
export const BASE_ENEMY_GOLD = 5;

// === META PROGRESSION ===
export const UPGRADE_TYPES = {
  MAX_HEALTH: 'maxHealth',
  DROP_RATE: 'dropRate',
  GOLD_GAIN: 'goldGain',
  BASE_ATTACK: 'baseAttack',
  BASE_DEFENSE: 'baseDefense',
};

export const UPGRADE_CONFIG = {
  [UPGRADE_TYPES.MAX_HEALTH]:   { label: 'Max Health',    baseValue: 10,   baseCost: 100,  costScale: 2.2, maxLevel: 20 },
  [UPGRADE_TYPES.DROP_RATE]:    { label: 'Drop Rate',     baseValue: 0.02, baseCost: 150,  costScale: 2.5, maxLevel: 15 },
  [UPGRADE_TYPES.GOLD_GAIN]:    { label: 'Gold Gain',     baseValue: 0.10, baseCost: 100,  costScale: 2.0, maxLevel: 20 },
  [UPGRADE_TYPES.BASE_ATTACK]:  { label: 'Base Attack',   baseValue: 2,    baseCost: 120,  costScale: 2.3, maxLevel: 20 },
  [UPGRADE_TYPES.BASE_DEFENSE]: { label: 'Base Defense',  baseValue: 1,    baseCost: 120,  costScale: 2.3, maxLevel: 20 },
};

// === SET BONUSES ===
export const ITEM_SETS = {
  WARDENS_VIGIL: {
    name: "Warden's Vigil",
    pieces: ['weapon', 'helmet', 'chest', 'gloves', 'boots', 'ring'],
    bonuses: {
      2: { label: '+15% Defense', defensePercent: 0.15 },
      4: { label: 'Ward Shield: Block one hit every 10s', wardShield: true },
      6: { label: 'Veil Aura: Nearby enemies deal -20% damage', veilAura: true },
    },
  },
  EMBERCLAVE_RESONANCE: {
    name: 'Emberclave Resonance',
    pieces: ['weapon', 'helmet', 'chest', 'gloves', 'boots', 'ring'],
    bonuses: {
      2: { label: '+10% All Elemental Damage', allElementalPercent: 0.10 },
      4: { label: 'Shard Pulse: AoE damage every 5s', shardPulse: true },
      6: { label: 'Resonance Cascade: Double elemental procs', resonanceCascade: true },
    },
  },
  THORNWATCH_REGROWTH: {
    name: 'Thornwatch Regrowth',
    pieces: ['weapon', 'helmet', 'chest', 'gloves', 'boots', 'ring'],
    bonuses: {
      2: { label: '+3 HP regen per second', hpRegen: 3 },
      4: { label: 'Overgrowth: Poison enemies on hit', overgrowthPoison: true },
      6: { label: "Solenne's Blessing: Revive once per run", revival: true },
    },
  },
  CONSORTIUM_FORTUNE: {
    name: 'Consortium Fortune',
    pieces: ['weapon', 'helmet', 'chest', 'gloves', 'boots', 'ring'],
    bonuses: {
      2: { label: '+20% Gold Find', goldFindPercent: 0.20 },
      4: { label: 'Lucky Drops: +15% rare+ drop rate', luckyDrops: true },
      6: { label: "Copperhold's Deal: Shop prices -30%", shopDiscount: true },
    },
  },
  ASHBORN_COVENANT: {
    name: 'Ashborn Covenant',
    pieces: ['weapon', 'helmet', 'chest', 'gloves', 'boots', 'ring'],
    bonuses: {
      2: { label: '+10% Fire Damage', fireDamagePercent: 0.10 },
      4: { label: "Pyrevast's Dream: Burns enemies on crit", burnOnCrit: true },
      6: { label: 'Ember Ascension: +50% damage below 30% HP', emberAscension: true },
    },
  },
  SEVENFORGE_LEGACY: {
    name: 'Sevenforge Legacy',
    pieces: ['weapon', 'helmet', 'chest', 'gloves', 'boots', 'ring'],
    bonuses: {
      2: { label: '+5% All Stats', allStatsPercent: 0.05 },
      4: { label: 'Divine Echo: Random god blessing each fight', divineEcho: true },
      6: { label: 'The Prethering: Transcend damage limits', prethering: true },
    },
  },
};

// === ZONES ===
export const ZONES = [
  { id: 'ashveil', name: 'Ashveil Outskirts', color: '#cc8833', unlockDepth: 0 },
  { id: 'embersteppe', name: 'Embersteppe', color: '#cc4400', unlockDepth: 10 },
  { id: 'thornwood', name: 'Thornwood', color: '#2a5a28', unlockDepth: 10 },
  { id: 'ironholt', name: 'Ironholt', color: '#334455', unlockDepth: 25 },
  { id: 'scarred_ring', name: 'The Scarred Ring', color: '#882211', unlockDepth: 40 },
  { id: 'ashen_maw', name: 'The Ashen Maw', color: '#ffdd44', unlockDepth: 60 },
];
