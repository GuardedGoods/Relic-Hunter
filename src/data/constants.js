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
export const INVENTORY_SIZE = 12;
export const INVENTORY_COLS = 4;
export const INVENTORY_ROWS = 3;

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
  ASHEN_KING: {
    name: 'Ashen King',
    pieces: ['weapon', 'helmet', 'chest', 'gloves', 'boots', 'ring'],
    bonuses: {
      2: { label: '+10% Fire Damage', fireDamagePercent: 0.10 },
      4: { label: 'Fire attacks burn enemies', burn: true },
      6: { label: 'Explosions on kill', explosionOnKill: true },
    },
  },
  FROST_WARDEN: {
    name: 'Frost Warden',
    pieces: ['weapon', 'helmet', 'chest', 'gloves', 'boots', 'ring'],
    bonuses: {
      2: { label: '+10% Ice Damage', iceDamagePercent: 0.10 },
      4: { label: 'Attacks slow enemies', slow: true },
      6: { label: 'Freeze on crit', freezeOnCrit: true },
    },
  },
  VENOM_LORD: {
    name: 'Venom Lord',
    pieces: ['weapon', 'helmet', 'chest', 'gloves', 'boots', 'ring'],
    bonuses: {
      2: { label: '+10% Poison Damage', poisonDamagePercent: 0.10 },
      4: { label: 'Poison spreads to nearby enemies', poisonSpread: true },
      6: { label: 'Enemies explode in poison on death', poisonExplosion: true },
    },
  },
};

// === ZONES ===
export const ZONES = [
  { id: 'crypt', name: 'Forgotten Crypt', color: '#4a5568', unlockDepth: 0 },
  { id: 'ruins', name: 'Ancient Ruins', color: '#9b7653', unlockDepth: 10 },
  { id: 'volcano', name: 'Volcanic Depths', color: '#c53030', unlockDepth: 25 },
  { id: 'glacier', name: 'Frozen Caverns', color: '#3182ce', unlockDepth: 40 },
  { id: 'void', name: 'The Void', color: '#6b21a8', unlockDepth: 60 },
];
