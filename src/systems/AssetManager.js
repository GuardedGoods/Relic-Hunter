/**
 * AssetManager — handles loading and fallback for sprite/background images.
 * If an image file exists in public/assets/, it's used. Otherwise, the game
 * falls back to procedural drawing (shapes via Phaser Graphics).
 */

// Asset manifest — maps logical names to file paths
const ASSETS = {
  // Hero sprites
  hero: 'assets/sprites/hero.png',

  // Enemy sprites (mapped by keyword in enemy name)
  'enemy-wolf': 'assets/sprites/enemy-wolf.png',
  'enemy-golem': 'assets/sprites/enemy-golem.png',
  'enemy-wraith': 'assets/sprites/enemy-wraith.png',
  'enemy-undead': 'assets/sprites/enemy-undead.png',
  'enemy-humanoid': 'assets/sprites/enemy-humanoid.png',
  'enemy-boss': 'assets/sprites/enemy-boss.png',

  // Zone backgrounds
  'bg-ashveil': 'assets/backgrounds/ashveil.png',
  'bg-embersteppe': 'assets/backgrounds/embersteppe.png',
  'bg-thornwood': 'assets/backgrounds/thornwood.png',
  'bg-ironholt': 'assets/backgrounds/ironholt.png',
  'bg-scarred_ring': 'assets/backgrounds/scarred-ring.png',
  'bg-ashen_maw': 'assets/backgrounds/ashen-maw.png',

  // Ability icons
  'icon-cleave': 'assets/sprites/icons/cleave.png',
  'icon-rend': 'assets/sprites/icons/rend.png',
  'icon-execute': 'assets/sprites/icons/execute.png',
  'icon-ember-vial': 'assets/sprites/icons/ember-vial.png',
};

// Enemy name keywords → sprite key mapping
const ENEMY_SPRITE_MAP = [
  { keywords: ['wolf', 'hound', 'drake', 'howler', 'stag'], sprite: 'enemy-wolf' },
  { keywords: ['golem', 'construct', 'sentinel', 'automaton'], sprite: 'enemy-golem' },
  { keywords: ['wraith', 'ghost', 'shade', 'specter', 'sprite'], sprite: 'enemy-wraith' },
  { keywords: ['shambler', 'taken', 'revenant', 'bound', 'rememberer'], sprite: 'enemy-undead' },
];

/**
 * Get the sprite key for an enemy based on its name.
 */
export function getEnemySpriteKey(enemyName, isBoss) {
  if (isBoss) return 'enemy-boss';
  const lower = enemyName.toLowerCase();
  for (const entry of ENEMY_SPRITE_MAP) {
    if (entry.keywords.some(kw => lower.includes(kw))) return entry.sprite;
  }
  return 'enemy-humanoid';
}

/**
 * Get the background key for a zone.
 */
export function getZoneBgKey(zoneId) {
  return `bg-${zoneId}`;
}

/**
 * Preload all assets in a Phaser scene's preload() method.
 * Assets that fail to load are silently ignored (fallback to procedural).
 */
export function preloadAssets(scene) {
  // Set to silent — don't throw errors for missing assets
  scene.load.on('loaderror', (file) => {
    // Silently mark as unavailable
    console.debug(`Asset not found (using procedural fallback): ${file.key}`);
  });

  for (const [key, path] of Object.entries(ASSETS)) {
    scene.load.image(key, path);
  }
}

/**
 * Check if a specific asset was successfully loaded.
 */
export function hasAsset(scene, key) {
  return scene.textures.exists(key) && scene.textures.get(key).key !== '__MISSING';
}

/**
 * Draw a sprite image if available, otherwise return false (caller draws procedurally).
 * @param {Phaser.Scene} scene
 * @param {string} key — asset key
 * @param {number} x — center X
 * @param {number} y — center Y
 * @param {number} maxW — max width to scale to
 * @param {number} maxH — max height to scale to
 * @returns {Phaser.GameObjects.Image|null}
 */
export function drawSpriteOrNull(scene, key, x, y, maxW, maxH) {
  if (!hasAsset(scene, key)) return null;

  const img = scene.add.image(x, y, key).setDepth(3);

  // Scale to fit within bounds
  const tex = img.texture.getSourceImage();
  const scaleX = maxW / tex.width;
  const scaleY = maxH / tex.height;
  const scale = Math.min(scaleX, scaleY, 1); // don't upscale beyond original
  img.setScale(scale);

  return img;
}

/**
 * Draw a background image if available, otherwise return false.
 */
export function drawBgOrNull(scene, zoneId, w, h) {
  const key = getZoneBgKey(zoneId);
  if (!hasAsset(scene, key)) return null;

  const img = scene.add.image(w / 2, h / 2, key).setDepth(0);

  // Scale to cover the entire area
  const tex = img.texture.getSourceImage();
  const scaleX = w / tex.width;
  const scaleY = h / tex.height;
  img.setScale(Math.max(scaleX, scaleY));

  return img;
}
