export const CLASSES = {
  slayer: {
    name: 'Slayer',
    description: 'A relentless melee warrior who wades into combat with fury-powered strikes.',
    icon: '\u2694',
    color: '#e94560',
    resource: { name: 'Fury', max: 100, color: '#e94560', decay: 20, decayDelay: 3000 },
    baseStatBonuses: { attack: 3, maxHealth: 20 },
    abilities: [
      { key: 'cleave', name: 'Cleave', icon: '\uD83D\uDDE1', hotkey: 'Q', cooldown: 6000, furyCost: -15,
        description: 'Swing weapon in an arc,\ndealing 150% ATK damage.', color: 0xe94560 },
      { key: 'rend', name: 'Rend', icon: '\uD83E\uDE78', hotkey: 'W', cooldown: 10000, furyCost: 20,
        description: 'Strike that applies Bleed\n(50% ATK over 6s).', color: 0xff4444 },
      { key: 'execute', name: 'Execute', icon: '\uD83D\uDC80', hotkey: 'E', cooldown: 12000, furyCost: 40,
        description: 'Massive 300% ATK hit.\nOnly on enemies < 30% HP.', color: 0xaa0000 },
    ],
    talents: {
      berserker: {
        name: 'Berserker',
        icon: '\uD83D\uDD25',
        color: '#f97316',
        description: 'Unrelenting aggression. More damage, more speed.',
        tiers: [
          { id: 'bloodlust', name: 'Bloodlust', description: '+2% attack speed per rank on kill for 5s', maxPoints: 10 },
          { id: 'rampage', name: 'Rampage', description: '+3% attack damage per rank', maxPoints: 10 },
          { id: 'endless_rage', name: 'Endless Rage', description: '+2% crit damage per rank', maxPoints: 10 },
          { id: 'deathwish', name: 'Deathwish', description: '+3% damage per rank when below 50% HP', maxPoints: 10 },
          { id: 'onslaught', name: 'Onslaught', description: '+1% chance per rank for attacks to hit twice', maxPoints: 10 },
        ],
      },
      blademaster: {
        name: 'Blademaster',
        icon: '\uD83C\uDFAF',
        color: '#60a5fa',
        description: 'Calculated strikes. Crits, bleeds, and finesse.',
        tiers: [
          { id: 'surgical_strikes', name: 'Surgical Strikes', description: '+1% crit chance per rank', maxPoints: 10 },
          { id: 'deep_wounds', name: 'Deep Wounds', description: '+5% bleed damage per rank from Rend', maxPoints: 10 },
          { id: 'riposte', name: 'Riposte', description: '+2% dodge chance per rank', maxPoints: 10 },
          { id: 'blade_flurry', name: 'Blade Flurry', description: '+3% Cleave damage per rank', maxPoints: 10 },
          { id: 'thousand_cuts', name: 'Thousand Cuts', description: 'Crits reduce cooldowns by 0.1s per rank', maxPoints: 10 },
        ],
      },
      warlord: {
        name: 'Warlord',
        icon: '\uD83D\uDEE1',
        color: '#4ade80',
        description: 'Battlefield commander. Toughness, self-healing, and control.',
        tiers: [
          { id: 'iron_skin', name: 'Iron Skin', description: '+2% damage reduction per rank', maxPoints: 10 },
          { id: 'rallying_cry', name: 'Rallying Cry', description: '+1% max HP healed per rank on Cleave', maxPoints: 10 },
          { id: 'undying', name: 'Undying', description: '+2% max HP per rank', maxPoints: 10 },
          { id: 'commanding_presence', name: 'Commanding Presence', description: '+1% defense per rank', maxPoints: 10 },
          { id: 'last_stand', name: 'Last Stand', description: '+2% lifesteal per rank when below 30% HP', maxPoints: 10 },
        ],
      },
    },
  },
};

// Talent point costs: need 1 point in previous tier to unlock next
export const TALENT_POINTS_PER_LEVEL = 1; // gain 1 talent point per level
export const TALENT_TIER_UNLOCK_POINTS = [0, 5, 15, 25, 40]; // points spent in tree to unlock each tier
