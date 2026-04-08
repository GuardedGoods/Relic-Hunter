const SAVE_KEY = 'relicHunter_save';
const SETTINGS_KEY = 'relicHunter_settings';

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  musicEnabled: true,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  showDamageNumbers: true,
  autoPickupCommon: false,
};

/**
 * Save the player's state to localStorage.
 * @param {import('../models/Player.js').Player} player
 */
export function saveGame(player) {
  try {
    const data = player.toSaveData();
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save game:', e);
  }
}

/**
 * Load the saved player data from localStorage.
 * @returns {Object|null} The parsed save data, or null if no save exists.
 */
export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load save:', e);
    return null;
  }
}

/**
 * Check if a save file exists.
 * @returns {boolean}
 */
export function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Delete the save file.
 */
export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

/**
 * Save user settings to localStorage.
 * @param {Object} settings - Partial or full settings object.
 */
export function saveSettings(settings) {
  try {
    // Merge with existing settings so partial updates work
    const current = loadSettings();
    const merged = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

/**
 * Load user settings from localStorage, falling back to defaults.
 * @returns {Object} The merged settings.
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const saved = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return { ...DEFAULT_SETTINGS };
  }
}
