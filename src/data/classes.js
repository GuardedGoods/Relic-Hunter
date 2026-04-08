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
        description: 'Unrelenting aggression. More damage, more fury, more speed.',
        tiers: [
          { id: 'bloodlust', name: 'Bloodlust', description: 'Kill grants +15% attack speed for 5s (stacks 3x)', maxPoints: 1 },
          { id: 'rampage', name: 'Rampage', description: 'When Fury is full, next 3 attacks deal +40% damage', maxPoints: 1 },
          { id: 'endless_rage', name: 'Endless Rage', description: 'Fury no longer decays out of combat', maxPoints: 1 },
          { id: 'deathwish', name: 'Deathwish', description: 'Below 30% HP, damage dealt increases by 25%', maxPoints: 1 },
          { id: 'onslaught', name: 'Onslaught', description: 'Every 5th attack triggers a free Cleave', maxPoints: 1 },
        ],
      },
      blademaster: {
        name: 'Blademaster',
        icon: '\uD83C\uDFAF',
        color: '#60a5fa',
        description: 'Calculated strikes. Crits, bleeds, and finesse.',
        tiers: [
          { id: 'surgical_strikes', name: 'Surgical Strikes', description: '+15% crit chance on bleeding targets', maxPoints: 1 },
          { id: 'deep_wounds', name: 'Deep Wounds', description: 'Rend stacks 3x and lasts 10s', maxPoints: 1 },
          { id: 'riposte', name: 'Riposte', description: 'After blocking, next attack is guaranteed crit', maxPoints: 1 },
          { id: 'blade_flurry', name: 'Blade Flurry', description: 'Cleave hits twice for 50% extra damage', maxPoints: 1 },
          { id: 'thousand_cuts', name: 'Thousand Cuts', description: 'Critical hits reduce all cooldowns by 1s', maxPoints: 1 },
        ],
      },
      warlord: {
        name: 'Warlord',
        icon: '\uD83D\uDEE1',
        color: '#4ade80',
        description: 'Battlefield commander. Toughness, self-healing, and control.',
        tiers: [
          { id: 'iron_skin', name: 'Iron Skin', description: '+15% damage reduction above 50% HP', maxPoints: 1 },
          { id: 'rallying_cry', name: 'Rallying Cry', description: 'Cleave also heals for 10% max HP', maxPoints: 1 },
          { id: 'undying', name: 'Undying', description: 'Fatal blow sets HP to 1 instead (once per run)', maxPoints: 1 },
          { id: 'commanding_presence', name: 'Commanding Presence', description: 'Enemies deal 10% less damage', maxPoints: 1 },
          { id: 'last_stand', name: 'Last Stand', description: 'Below 20% HP, gain 30% lifesteal for 8s', maxPoints: 1 },
        ],
      },
    },
  },
};

// Talent point costs: need 1 point in previous tier to unlock next
export const TALENT_POINTS_PER_LEVEL = 1; // gain 1 talent point per level
export const TALENT_TIER_UNLOCK_POINTS = [0, 1, 2, 3, 4]; // points needed in tree to reach each tier
