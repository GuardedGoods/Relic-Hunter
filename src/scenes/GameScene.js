import Phaser from 'phaser';
import { Player } from '../models/Player.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { EmberStormSystem } from '../systems/EmberStormSystem.js';
import { saveGame } from '../systems/SaveSystem.js';
import { RARITY_COLORS, ZONES } from '../data/constants.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.zoneData = data.zone || ZONES[0];
    this.saveData = data.saveData || null;
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.fadeIn(400, 0x1a, 0x1a, 0x2e);

    // ---- Create player ----
    if (this.saveData) {
      this.player = Player.fromSaveData(this.saveData);
    } else {
      this.player = new Player();
    }

    // Initialize run-time fields the combat system reads
    const stats = this.player.getComputedStats();
    this.player.stats = stats;
    this.player.health = this.player.currentHealth || stats.maxHealth;
    this.player.level = this.player.level || 1;
    this.player.xp = this.player.xp || 0;
    this.player.xpToLevel = this.player.xpToLevel || 100;
    this.player.dropRateBonus = stats.dropRateBonus || 0;
    this.player.attackSpeed = stats.attackSpeed || 1;

    // Run stats tracking
    this.runStats = {
      enemiesKilled: 0,
      goldEarned: 0,
      itemsFound: [],
      bestItem: null,
      startDepth: 0,
      died: false,
    };

    // Each run starts at depth 0 (maxDepthReached is only for zone unlocks)
    this.currentDepth = 0;

    // ---- Combat system ----
    this.combatSystem = new CombatSystem();
    this.combatSystem.startCombat(this.player, this.zoneData.id, this.currentDepth);

    // ---- Ember Storm system ----
    this.emberStorm = new EmberStormSystem();
    this.stormOverlay = null;
    this.stormLabel = null;

    // ---- Draw combat area background (zone-specific, left side: 0-500px) ----
    const combatBg = this.add.graphics();
    this._drawZoneBackground(combatBg, 500, height, this.zoneData.id);
    // Subtle border on right edge
    combatBg.lineStyle(2, 0x333355, 1);
    combatBg.lineBetween(499, 0, 499, height);

    // ---- Zone + depth header ----
    this.zoneLabel = this.add.text(250, 16, this.zoneData.name, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: this.zoneData.color || '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);

    this.depthLabel = this.add.text(250, 40, `Depth: ${this.currentDepth}`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#aaaacc',
    }).setOrigin(0.5).setDepth(2);

    this.killCountLabel = this.add.text(250, 58, 'Kills: 0', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#888899',
    }).setOrigin(0.5).setDepth(2);

    // Ember Storm indicator (hidden initially)
    this.stormOverlay = this.add.graphics().setDepth(1).setAlpha(0);
    this.stormLabel = this.add.text(250, 76, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#ffdd44', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2).setVisible(false);

    // ---- Player character (left side) ----
    this.playerX = 140;
    this.playerY = 350;
    this.playerGfx = this.add.graphics().setDepth(3);
    this._drawPlayer();

    // Player name label
    this.add.text(this.playerX, this.playerY - 70, 'HERO', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#4ade80',
    }).setOrigin(0.5).setDepth(3);

    // Player health bar
    this.playerHealthBarBg = this.add.graphics().setDepth(3);
    this.playerHealthBarFill = this.add.graphics().setDepth(4);
    this.playerHealthText = this.add.text(this.playerX, this.playerY - 48, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(5);
    this._updatePlayerHealthBar();

    // ---- Enemy character (right side of combat area) ----
    this.enemyX = 360;
    this.enemyY = 350;
    this.enemyGfx = this.add.graphics().setDepth(3);
    this._drawEnemy();

    // Enemy name label
    this.enemyNameLabel = this.add.text(this.enemyX, this.enemyY - 70, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ff6666',
    }).setOrigin(0.5).setDepth(3);

    // Elite badge
    this.eliteBadge = this.add.text(this.enemyX, this.enemyY - 85, 'ELITE', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#f97316',
      fontStyle: 'bold',
      backgroundColor: '#3a1a00',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(4).setVisible(false);

    // Enemy health bar
    this.enemyHealthBarBg = this.add.graphics().setDepth(3);
    this.enemyHealthBarFill = this.add.graphics().setDepth(4);
    this.enemyHealthText = this.add.text(this.enemyX, this.enemyY - 48, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(5);
    this._updateEnemyDisplay();

    // ---- Level / XP display ----
    this.levelLabel = this.add.text(20, height - 30, `Lv.${this.player.level}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#f0c040',
    }).setDepth(2);

    // ---- Combat log area ----
    this.combatLogTexts = [];
    this.combatLogY = 480;

    // ---- Retreat button (top-right of combat area) ----
    this._createRetreatButton();

    // ---- Manage Gear (pause) button ----
    this.isPaused = false;
    const pauseBtnW = 160;
    const pauseBtnH = 36;
    const pauseBtnX = 250; // center of combat area
    const pauseBtnY = height - 30;
    this.pauseBtnBg = this.add.graphics();
    this.pauseBtnBg.fillStyle(0x0f3460, 1);
    this.pauseBtnBg.fillRoundedRect(pauseBtnX - pauseBtnW / 2, pauseBtnY - pauseBtnH / 2, pauseBtnW, pauseBtnH, 8);
    this.pauseBtnBg.lineStyle(2, 0xe94560, 1);
    this.pauseBtnBg.strokeRoundedRect(pauseBtnX - pauseBtnW / 2, pauseBtnY - pauseBtnH / 2, pauseBtnW, pauseBtnH, 8);

    this.pauseBtnText = this.add.text(pauseBtnX, pauseBtnY, '⚔ MANAGE GEAR', {
      fontFamily: 'monospace', fontSize: '14px', color: '#e94560', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.pauseHitArea = this.add.rectangle(pauseBtnX, pauseBtnY, pauseBtnW, pauseBtnH)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);

    this.pauseHitArea.on('pointerover', () => {
      this.pauseBtnBg.clear();
      this.pauseBtnBg.fillStyle(0x1a4a80, 1);
      this.pauseBtnBg.fillRoundedRect(pauseBtnX - pauseBtnW / 2, pauseBtnY - pauseBtnH / 2, pauseBtnW, pauseBtnH, 8);
      this.pauseBtnBg.lineStyle(2, 0xff6680, 1);
      this.pauseBtnBg.strokeRoundedRect(pauseBtnX - pauseBtnW / 2, pauseBtnY - pauseBtnH / 2, pauseBtnW, pauseBtnH, 8);
    });

    this.pauseHitArea.on('pointerout', () => {
      this._updatePauseButton();
    });

    this.pauseHitArea.on('pointerdown', () => {
      this.togglePause();
    });

    // Pause overlay
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.setVisible(false);
    this.pauseOverlay.setDepth(50);

    this.pauseText = this.add.text(250, height / 2 - 40, '', {
      fontFamily: 'monospace', fontSize: '20px', color: '#e94560', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(51).setVisible(false);

    this.pauseSubText = this.add.text(250, height / 2, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#aaaacc',
    }).setOrigin(0.5).setDepth(51).setVisible(false);

    // Space bar to toggle pause
    this.input.keyboard.on('keydown-SPACE', () => {
      this.togglePause();
    });

    // ---- 2x Speed toggle button ----
    this.speedMultiplier = 1;
    const speedBtnW = 60;
    const speedBtnH = 28;
    const speedBtnX = 460;
    const speedBtnY = height - 30;
    this.speedBtnBg = this.add.graphics();
    this._drawSpeedBtn(speedBtnX, speedBtnY, speedBtnW, speedBtnH);

    this.speedBtnText = this.add.text(speedBtnX, speedBtnY, '1x', {
      fontFamily: 'monospace', fontSize: '13px', color: '#aaaacc', fontStyle: 'bold',
    }).setOrigin(0.5);

    const speedHit = this.add.rectangle(speedBtnX, speedBtnY, speedBtnW, speedBtnH)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);

    speedHit.on('pointerdown', () => {
      this.speedMultiplier = this.speedMultiplier === 1 ? 2 : 1;
      this.speedBtnText.setText(this.speedMultiplier === 1 ? '1x' : '2x');
      this.speedBtnText.setColor(this.speedMultiplier === 2 ? '#f0c040' : '#aaaacc');
      this._drawSpeedBtn(speedBtnX, speedBtnY, speedBtnW, speedBtnH);
    });

    // ---- Shard Powers Hotbar (WoW-style) ----
    this.abilityButtons = {};
    this.abilityTooltip = null;
    const abilityDefs = [
      { key: 'shardBurst', icon: '🔥', hotkey: 'Q', color: 0xf97316, borderColor: 0xcc5500, textColor: '#f97316',
        name: 'Shard Burst', desc: 'Deal 200% ATK damage\nto the current enemy.', cd: '8s' },
      { key: 'threshWard', icon: '🛡', hotkey: 'W', color: 0x4ade80, borderColor: 0x228844, textColor: '#4ade80',
        name: "Thresh's Ward", desc: 'Block the next 3\nenemy attacks.', cd: '15s' },
      { key: 'emberHeal', icon: '💎', hotkey: 'E', color: 0x60a5fa, borderColor: 0x3366aa, textColor: '#60a5fa',
        name: 'Ember Heal', desc: 'Restore 35% of\nyour max HP.', cd: '12s' },
    ];

    const abSize = 52;
    const abGap = 6;
    const abTotalW = abilityDefs.length * abSize + (abilityDefs.length - 1) * abGap;
    const abStartX = 250 - abTotalW / 2; // centered in combat area
    const abBarY = 440;

    // Hotbar background strip
    const hotbarBg = this.add.graphics().setDepth(7);
    hotbarBg.fillStyle(0x0a0a18, 0.85);
    hotbarBg.fillRoundedRect(abStartX - 8, abBarY - 6, abTotalW + 16, abSize + 28, 6);
    hotbarBg.lineStyle(1, 0x333355, 0.8);
    hotbarBg.strokeRoundedRect(abStartX - 8, abBarY - 6, abTotalW + 16, abSize + 28, 6);

    abilityDefs.forEach((def, i) => {
      const ax = abStartX + i * (abSize + abGap);
      const ay = abBarY;

      // Slot background (dark inset square)
      const bg = this.add.graphics().setDepth(8);
      bg.fillStyle(0x111128, 1);
      bg.fillRoundedRect(ax, ay, abSize, abSize, 4);
      bg.lineStyle(2, def.borderColor, 1);
      bg.strokeRoundedRect(ax, ay, abSize, abSize, 4);

      // Icon (large centered emoji)
      const icon = this.add.text(ax + abSize / 2, ay + abSize / 2 - 2, def.icon, {
        fontSize: '22px',
      }).setOrigin(0.5).setDepth(9);

      // Hotkey badge (small letter in corner)
      const hotkeyBadge = this.add.text(ax + 4, ay + 2, def.hotkey, {
        fontFamily: 'monospace', fontSize: '10px', color: '#ffffff', fontStyle: 'bold',
        backgroundColor: '#00000088', padding: { x: 2, y: 0 },
      }).setDepth(10);

      // Cooldown sweep overlay
      const cdOverlay = this.add.graphics().setDepth(10).setAlpha(0.7);

      // Cooldown seconds text (centered)
      const cdText = this.add.text(ax + abSize / 2, ay + abSize / 2, '', {
        fontFamily: 'monospace', fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(11).setVisible(false);
      cdText.setShadow(1, 1, '#000000', 2);

      // Ward charges label (only used for threshWard, hidden for others)
      const nameLabel = this.add.text(ax + abSize / 2, ay + abSize + 2, '', {
        fontFamily: 'monospace', fontSize: '9px', color: '#888899',
      }).setOrigin(0.5).setDepth(9);

      // Hit area for click + hover
      const hitArea = this.add.rectangle(ax + abSize / 2, ay + abSize / 2, abSize, abSize)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.001).setDepth(12);

      hitArea.on('pointerdown', () => this._useAbility(def.key));

      hitArea.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x1a1a3a, 1);
        bg.fillRoundedRect(ax, ay, abSize, abSize, 4);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(ax, ay, abSize, abSize, 4);
        this._showAbilityTooltip(ax + abSize / 2, ay - 8, def);
      });

      hitArea.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(0x111128, 1);
        bg.fillRoundedRect(ax, ay, abSize, abSize, 4);
        bg.lineStyle(2, def.borderColor, 1);
        bg.strokeRoundedRect(ax, ay, abSize, abSize, 4);
        this._hideAbilityTooltip();
      });

      this.abilityButtons[def.key] = { bg, icon, cdOverlay, cdText, nameLabel, x: ax, y: ay, w: abSize, h: abSize, color: def.color, borderColor: def.borderColor, def };

      // Keyboard hotkey
      this.input.keyboard.on(`keydown-${def.hotkey}`, () => this._useAbility(def.key));
    });

    // ---- Auto-save timer ----
    this.autoSaveTimer = 0;

    // ---- Launch UIScene in parallel ----
    this.scene.launch('UIScene', { player: this.player });

    // ---- Damage number pool ----
    this.damageNumbers = [];
  }

  update(time, delta) {
    if (!this.combatSystem || !this.combatSystem.active) return;

    // Refresh player stats for combat system
    const stats = this.player.getComputedStats();
    this.player.stats = stats;
    this.player.attackSpeed = stats.attackSpeed || 1;
    this.player.dropRateBonus = (stats.dropRateBonus || 0) + this.emberStorm.getDropRateBonus();

    // Apply Ember Storm enemy damage multiplier
    this.combatSystem.enemyDamageMult = this.emberStorm.getEnemyDamageMult();

    // Process combat tick (apply speed multiplier)
    const events = this.combatSystem.tick(delta * this.speedMultiplier);

    for (const event of events) {
      switch (event.type) {
        case 'playerAttack':
          this._onPlayerAttack(event.data);
          break;
        case 'enemyAttack':
          this._onEnemyAttack(event.data);
          break;
        case 'enemyDeath':
          this._onEnemyDeath(event.data);
          break;
        case 'lootDrop':
          this._onLootDrop(event.data);
          break;
        case 'playerDeath':
          this._onPlayerDeath(event.data);
          break;
        case 'levelUp':
          this._onLevelUp(event.data);
          break;
      }
    }

    // Update damage number animations
    this._updateDamageNumbers(delta);

    // Update health bars
    this._updatePlayerHealthBar();

    // Update ability cooldown displays
    this._updateAbilityBar();

    // Ember Storm tick
    if (this.emberStorm.active) {
      const stormEnded = this.emberStorm.tick(delta * this.speedMultiplier);
      const status = this.emberStorm.getStatus(this.currentDepth);
      this.stormLabel.setText(`EMBER STORM ${status.remainingSeconds}s`).setVisible(true);
      // Pulsing amber overlay
      const pulse = 0.08 + Math.sin(Date.now() / 300) * 0.04;
      this.stormOverlay.clear();
      this.stormOverlay.fillStyle(0xff8800, pulse);
      this.stormOverlay.fillRect(0, 0, 500, this.scale.height);
      this.stormOverlay.setAlpha(1);
      if (stormEnded) {
        this.stormOverlay.clear().setAlpha(0);
        this.stormLabel.setVisible(false);
        this._addCombatLog('The Ember Storm subsides...', '#888899');
      }
    }

    // Auto-save every 30 seconds
    this.autoSaveTimer += delta;
    if (this.autoSaveTimer >= 30000) {
      this.autoSaveTimer = 0;
      this._autoSave();
    }
  }

  // ---- Drawing helpers ----

  _drawPlayer() {
    const g = this.playerGfx;
    const px = this.playerX;
    const py = this.playerY;
    g.clear();
    // Legs
    g.fillStyle(0x334455, 1);
    g.fillRect(px - 14, py + 15, 10, 20);
    g.fillRect(px + 4, py + 15, 10, 20);
    // Boots
    g.fillStyle(0x5a3a1a, 1);
    g.fillRect(px - 16, py + 30, 14, 6);
    g.fillRect(px + 2, py + 30, 14, 6);
    // Torso (armor)
    g.fillStyle(0x2a6a4a, 1);
    g.fillRect(px - 18, py - 18, 36, 34);
    g.lineStyle(1, 0x3a8a6a, 1);
    g.strokeRect(px - 18, py - 18, 36, 34);
    // Belt
    g.fillStyle(0x7a5a2a, 1);
    g.fillRect(px - 18, py + 12, 36, 5);
    // Shoulder pads
    g.fillStyle(0x3a7a5a, 1);
    g.fillRect(px - 22, py - 18, 8, 10);
    g.fillRect(px + 14, py - 18, 8, 10);
    // Arms
    g.fillStyle(0x2a6a4a, 1);
    g.fillRect(px - 24, py - 8, 8, 20);
    g.fillRect(px + 16, py - 8, 8, 20);
    // Gloves
    g.fillStyle(0x5a3a1a, 1);
    g.fillCircle(px - 20, py + 14, 5);
    g.fillCircle(px + 20, py + 14, 5);
    // Head
    g.fillStyle(0xddbbaa, 1);
    g.fillCircle(px, py - 28, 12);
    // Helmet
    g.fillStyle(0x4a8a6a, 1);
    g.fillRect(px - 13, py - 40, 26, 12);
    g.lineStyle(1, 0x5aaa8a, 1);
    g.strokeRect(px - 13, py - 40, 26, 12);
    // Visor slit
    g.fillStyle(0x111111, 1);
    g.fillRect(px - 8, py - 33, 16, 3);
    // Weapon (sword)
    g.lineStyle(3, 0xaaaacc, 1);
    g.lineBetween(px + 24, py + 10, px + 36, py - 22);
    // Sword guard
    g.lineStyle(2, 0x7a5a2a, 1);
    g.lineBetween(px + 20, py - 2, px + 30, py - 2);
    // Cape (behind, subtle)
    g.fillStyle(0x1a4a3a, 0.6);
    g.fillTriangle(px - 14, py - 14, px + 14, py - 14, px, py + 25);
  }

  _drawEnemy() {
    const g = this.enemyGfx;
    g.clear();
    const enemy = this.combatSystem.enemy;
    if (!enemy) return;

    const ex = this.enemyX;
    const ey = this.enemyY;
    const isBoss = enemy.isBoss || false;
    const s = isBoss ? 1.4 : 1;
    const name = enemy.name.toLowerCase();

    // Pick shape/colors based on enemy name keywords
    if (name.includes('wolf') || name.includes('hound') || name.includes('drake')) {
      // Quadruped beast
      const bodyColor = isBoss ? 0xffdd44 : (enemy.isElite ? 0xf97316 : 0x885544);
      g.fillStyle(bodyColor, 1);
      g.fillRect(ex - 28 * s, ey - 5 * s, 56 * s, 24 * s); // long body
      g.fillCircle(ex + 26 * s, ey, 12 * s); // head
      g.fillStyle(0x000000, 1);
      g.fillCircle(ex + 30 * s, ey - 4 * s, 2 * s); // eye
      // Legs
      g.fillStyle(bodyColor, 0.9);
      g.fillRect(ex - 22 * s, ey + 16 * s, 6 * s, 18 * s);
      g.fillRect(ex - 8 * s, ey + 16 * s, 6 * s, 18 * s);
      g.fillRect(ex + 8 * s, ey + 16 * s, 6 * s, 18 * s);
      g.fillRect(ex + 20 * s, ey + 16 * s, 6 * s, 18 * s);
      // Tail
      g.lineStyle(3 * s, bodyColor, 1);
      g.lineBetween(ex - 28 * s, ey, ex - 38 * s, ey - 14 * s);
    } else if (name.includes('golem') || name.includes('construct') || name.includes('sentinel')) {
      // Hulking golem
      const bodyColor = isBoss ? 0xffdd44 : (enemy.isElite ? 0xf97316 : 0x667788);
      g.fillStyle(bodyColor, 1);
      g.fillRect(ex - 22 * s, ey - 30 * s, 44 * s, 50 * s); // wide torso
      g.fillRect(ex - 10 * s, ey + 20 * s, 8 * s, 16 * s); // left leg
      g.fillRect(ex + 2 * s, ey + 20 * s, 8 * s, 16 * s); // right leg
      g.fillRect(ex - 30 * s, ey - 20 * s, 10 * s, 30 * s); // left arm
      g.fillRect(ex + 20 * s, ey - 20 * s, 10 * s, 30 * s); // right arm
      // Head (small on top)
      g.fillStyle(bodyColor, 0.8);
      g.fillRect(ex - 8 * s, ey - 40 * s, 16 * s, 12 * s);
      g.fillStyle(isBoss ? 0xff0000 : 0x44ffff, 1);
      g.fillCircle(ex - 3 * s, ey - 35 * s, 2 * s);
      g.fillCircle(ex + 3 * s, ey - 35 * s, 2 * s);
      // Cracks / detail lines
      g.lineStyle(1, 0x445566, 0.6);
      g.lineBetween(ex - 10 * s, ey - 20 * s, ex + 5 * s, ey + 10 * s);
    } else if (name.includes('wraith') || name.includes('ghost') || name.includes('shade') || name.includes('specter')) {
      // Floating wraith (no legs, wispy)
      const bodyColor = isBoss ? 0xffdd44 : (enemy.isElite ? 0xf97316 : 0x6644aa);
      g.fillStyle(bodyColor, 0.6);
      g.fillCircle(ex, ey - 15 * s, 20 * s); // upper body / head
      g.fillTriangle(ex - 20 * s, ey - 5 * s, ex + 20 * s, ey - 5 * s, ex, ey + 35 * s); // wispy tail
      // Eyes (glowing)
      g.fillStyle(isBoss ? 0xff0000 : 0x00ffaa, 1);
      g.fillCircle(ex - 6 * s, ey - 18 * s, 3 * s);
      g.fillCircle(ex + 6 * s, ey - 18 * s, 3 * s);
      // Arms (floating wisps)
      g.lineStyle(2 * s, bodyColor, 0.5);
      g.lineBetween(ex - 18 * s, ey - 8 * s, ex - 30 * s, ey + 5 * s);
      g.lineBetween(ex + 18 * s, ey - 8 * s, ex + 30 * s, ey + 5 * s);
    } else if (name.includes('shambler') || name.includes('taken') || name.includes('revenant') || name.includes('bound')) {
      // Undead shambler (hunched humanoid)
      const bodyColor = isBoss ? 0xffdd44 : (enemy.isElite ? 0xf97316 : 0x556644);
      g.fillStyle(bodyColor, 1);
      g.fillRect(ex - 14 * s, ey - 20 * s, 28 * s, 40 * s); // body
      g.fillRect(ex - 8 * s, ey + 20 * s, 6 * s, 14 * s); // left leg
      g.fillRect(ex + 2 * s, ey + 20 * s, 6 * s, 14 * s); // right leg (shorter = limp)
      // Hunched head
      g.fillStyle(bodyColor, 0.7);
      g.fillCircle(ex + 4 * s, ey - 26 * s, 10 * s);
      // Hollow eyes
      g.fillStyle(0x000000, 1);
      g.fillCircle(ex + 1 * s, ey - 28 * s, 3 * s);
      g.fillCircle(ex + 8 * s, ey - 28 * s, 3 * s);
      // Dangling arm
      g.lineStyle(3 * s, bodyColor, 0.8);
      g.lineBetween(ex - 14 * s, ey - 10 * s, ex - 22 * s, ey + 15 * s);
      g.lineBetween(ex + 14 * s, ey - 10 * s, ex + 20 * s, ey + 8 * s);
    } else {
      // Default humanoid enemy
      const baseColor = isBoss ? 0xffdd44 : (enemy.isElite ? 0xf97316 : 0xe94560);
      const outlineColor = isBoss ? 0xcc9900 : (enemy.isElite ? 0xcc5500 : 0xbb2244);
      // Legs
      g.fillStyle(0x332222, 1);
      g.fillRect(ex - 10 * s, ey + 15 * s, 8 * s, 18 * s);
      g.fillRect(ex + 2 * s, ey + 15 * s, 8 * s, 18 * s);
      // Body
      g.fillStyle(baseColor, 1);
      g.fillRect(ex - 16 * s, ey - 18 * s, 32 * s, 34 * s);
      g.lineStyle(1, outlineColor, 1);
      g.strokeRect(ex - 16 * s, ey - 18 * s, 32 * s, 34 * s);
      // Arms
      g.fillStyle(baseColor, 0.9);
      g.fillRect(ex - 22 * s, ey - 12 * s, 8 * s, 22 * s);
      g.fillRect(ex + 14 * s, ey - 12 * s, 8 * s, 22 * s);
      // Head
      g.fillStyle(baseColor, 0.8);
      g.fillCircle(ex, ey - 28 * s, 11 * s);
      g.lineStyle(1, outlineColor, 1);
      g.strokeCircle(ex, ey - 28 * s, 11 * s);
      // Eyes
      g.fillStyle(isBoss ? 0xff0000 : 0xffffff, 1);
      g.fillCircle(ex - 4 * s, ey - 30 * s, 2.5 * s);
      g.fillCircle(ex + 4 * s, ey - 30 * s, 2.5 * s);
      g.fillStyle(0x000000, 1);
      g.fillCircle(ex - 4 * s, ey - 30 * s, 1.2 * s);
      g.fillCircle(ex + 4 * s, ey - 30 * s, 1.2 * s);
      // Weapon
      g.lineStyle(2 * s, 0x888888, 1);
      g.lineBetween(ex - 22 * s, ey + 8 * s, ex - 32 * s, ey - 12 * s);
    }
  }

  _drawZoneBackground(g, w, h, zoneId) {
    const zoneColors = {
      ashveil:      { sky: 0x1a1a2e, ground: 0x2a2520, accent: 0xcc8833 },
      embersteppe:  { sky: 0x1a1208, ground: 0x2a1a0a, accent: 0xcc4400 },
      thornwood:    { sky: 0x0e1e10, ground: 0x1a2a18, accent: 0x2a5a28 },
      ironholt:     { sky: 0x141418, ground: 0x222228, accent: 0x334455 },
      scarred_ring: { sky: 0x1a0a08, ground: 0x2a1510, accent: 0x882211 },
      ashen_maw:    { sky: 0x050508, ground: 0x1a1510, accent: 0xffdd44 },
    };
    const c = zoneColors[zoneId] || zoneColors.ashveil;

    // Sky gradient
    g.fillStyle(c.sky, 1);
    g.fillRect(0, 0, w, h);

    // Ground plane
    g.fillStyle(c.ground, 1);
    g.fillRect(0, h * 0.65, w, h * 0.35);
    g.lineStyle(1, c.accent, 0.3);
    g.lineBetween(0, h * 0.65, w, h * 0.65);

    // Zone-specific decorations
    if (zoneId === 'ashveil') {
      // Dead trees silhouettes
      for (let i = 0; i < 6; i++) {
        const tx = 30 + i * 85;
        const ty = h * 0.65;
        g.lineStyle(2, 0x3a3530, 0.5);
        g.lineBetween(tx, ty, tx, ty - 40 - i * 8);
        g.lineBetween(tx, ty - 25, tx - 12, ty - 40);
        g.lineBetween(tx, ty - 30, tx + 10, ty - 45);
      }
      // Ember crystals (small amber dots)
      g.fillStyle(0xcc8833, 0.4);
      for (let i = 0; i < 8; i++) g.fillCircle(50 + i * 60, h * 0.62 - (i % 3) * 15, 2 + (i % 2));
    } else if (zoneId === 'embersteppe') {
      // Lava cracks on ground
      g.lineStyle(1, 0xff4400, 0.3);
      for (let i = 0; i < 5; i++) {
        const lx = 20 + i * 100;
        g.lineBetween(lx, h * 0.7, lx + 40, h * 0.75);
        g.lineBetween(lx + 40, h * 0.75, lx + 20, h * 0.85);
      }
      // Distant volcano
      g.fillStyle(0x2a1a0a, 0.6);
      g.fillTriangle(380, h * 0.65, 440, h * 0.35, 500, h * 0.65);
      g.fillStyle(0xcc4400, 0.3);
      g.fillCircle(440, h * 0.36, 6);
    } else if (zoneId === 'thornwood') {
      // Dense canopy (overlapping circles on top)
      g.fillStyle(0x1a3a18, 0.6);
      for (let i = 0; i < 8; i++) g.fillCircle(30 + i * 65, h * 0.15 + (i % 2) * 20, 40 + (i % 3) * 10);
      // Tree trunks
      g.fillStyle(0x3a2a1a, 0.4);
      for (let i = 0; i < 4; i++) { g.fillRect(60 + i * 120, h * 0.25, 8, h * 0.42); }
      // Vines
      g.lineStyle(1, 0x2a5a28, 0.3);
      for (let i = 0; i < 5; i++) g.lineBetween(40 + i * 100, h * 0.2, 50 + i * 100, h * 0.5);
    } else if (zoneId === 'ironholt') {
      // Industrial structures (rectangles)
      g.fillStyle(0x222230, 0.5);
      g.fillRect(20, h * 0.4, 60, h * 0.25);
      g.fillRect(400, h * 0.35, 80, h * 0.3);
      // Smokestacks
      g.fillStyle(0x333340, 0.4);
      g.fillRect(40, h * 0.2, 12, h * 0.2);
      g.fillRect(430, h * 0.15, 12, h * 0.2);
      // Smoke wisps
      g.fillStyle(0x444455, 0.15);
      g.fillCircle(46, h * 0.18, 8);
      g.fillCircle(50, h * 0.12, 12);
      g.fillCircle(436, h * 0.13, 10);
    } else if (zoneId === 'scarred_ring') {
      // Lava rivers on ground
      g.fillStyle(0x882211, 0.4);
      g.fillRect(0, h * 0.78, w, 6);
      g.fillRect(0, h * 0.88, w, 4);
      // Obsidian spires
      g.fillStyle(0x0a0808, 0.7);
      g.fillTriangle(80, h * 0.65, 100, h * 0.3, 120, h * 0.65);
      g.fillTriangle(350, h * 0.65, 375, h * 0.25, 400, h * 0.65);
      // Glow at base of spires
      g.fillStyle(0x882211, 0.2);
      g.fillCircle(100, h * 0.65, 15);
      g.fillCircle(375, h * 0.65, 15);
    } else if (zoneId === 'ashen_maw') {
      // The crater glow (ominous amber from below)
      g.fillStyle(0xffdd44, 0.04);
      g.fillCircle(250, h * 0.9, 200);
      g.fillStyle(0xffdd44, 0.06);
      g.fillCircle(250, h * 0.9, 120);
      // Floating shard fragments
      g.fillStyle(0xffdd44, 0.3);
      for (let i = 0; i < 10; i++) {
        const fx = 30 + i * 48;
        const fy = h * 0.2 + (i % 3) * 30 + Math.sin(i) * 15;
        g.fillRect(fx - 2, fy - 4, 4, 8);
      }
      // Ground cracks glowing
      g.lineStyle(1, 0xffdd44, 0.15);
      for (let i = 0; i < 6; i++) g.lineBetween(i * 80 + 20, h * 0.7, i * 80 + 60, h * 0.9);
    }
  }

  _updatePlayerHealthBar() {
    const stats = this.player.stats || this.player.getComputedStats();
    const maxHp = stats.maxHealth || 100;
    const curHp = Math.max(0, this.player.health || 0);
    const ratio = curHp / maxHp;

    const barW = 80;
    const barH = 8;
    const bx = this.playerX - barW / 2;
    const by = this.playerY - 56;

    this.playerHealthBarBg.clear();
    this.playerHealthBarBg.fillStyle(0x333333, 1);
    this.playerHealthBarBg.fillRoundedRect(bx, by, barW, barH, 2);

    this.playerHealthBarFill.clear();
    const hpColor = ratio > 0.5 ? 0x4ade80 : (ratio > 0.25 ? 0xf0c040 : 0xe94560);
    if (ratio > 0) {
      this.playerHealthBarFill.fillStyle(hpColor, 1);
      this.playerHealthBarFill.fillRoundedRect(bx + 1, by + 1, (barW - 2) * ratio, barH - 2, 2);
    }

    this.playerHealthText.setText(`${Math.ceil(curHp)}/${Math.ceil(maxHp)}`);
    this.playerHealthText.setPosition(this.playerX, by - 2);
  }

  _updateEnemyDisplay() {
    const enemy = this.combatSystem.enemy;
    if (!enemy) return;

    this.enemyNameLabel.setText(enemy.name);
    if (enemy.isBoss) {
      this.eliteBadge.setText('BOSS').setVisible(true);
      this.eliteBadge.setColor('#ffdd44').setBackgroundColor('#4a3500');
    } else {
      this.eliteBadge.setText('ELITE').setVisible(enemy.isElite);
      this.eliteBadge.setColor('#f97316').setBackgroundColor('#3a1a00');
    }

    const maxHp = enemy.maxHealth || 1;
    const curHp = Math.max(0, enemy.health || 0);
    const ratio = curHp / maxHp;

    const barW = 80;
    const barH = 8;
    const bx = this.enemyX - barW / 2;
    const by = this.enemyY - 56;

    this.enemyHealthBarBg.clear();
    this.enemyHealthBarBg.fillStyle(0x333333, 1);
    this.enemyHealthBarBg.fillRoundedRect(bx, by, barW, barH, 2);

    this.enemyHealthBarFill.clear();
    const hpColor = ratio > 0.5 ? 0xe94560 : (ratio > 0.25 ? 0xf0c040 : 0x44aa44);
    if (ratio > 0) {
      this.enemyHealthBarFill.fillStyle(hpColor, 1);
      this.enemyHealthBarFill.fillRoundedRect(bx + 1, by + 1, (barW - 2) * ratio, barH - 2, 2);
    }

    this.enemyHealthText.setText(`${Math.ceil(curHp)}/${Math.ceil(maxHp)}`);
    this.enemyHealthText.setPosition(this.enemyX, by - 2);

    this._drawEnemy();
  }

  // ---- Event handlers ----

  _onPlayerAttack(data) {
    const { damage, isCrit } = data;

    // Flash enemy red
    this.enemyGfx.setAlpha(0.4);
    this.time.delayedCall(80, () => {
      if (this.enemyGfx) this.enemyGfx.setAlpha(1);
    });

    // Show damage number on enemy
    const color = isCrit ? '#f0c040' : '#ffffff';
    const size = isCrit ? '18px' : '14px';
    const prefix = isCrit ? 'CRIT ' : '';
    this._spawnDamageNumber(
      this.enemyX + Phaser.Math.Between(-20, 20),
      this.enemyY - 60,
      `${prefix}${damage}`,
      color,
      size
    );

    this._updateEnemyDisplay();
  }

  _onEnemyAttack(data) {
    const { damage, blocked, isCharged } = data;

    if (blocked) {
      // Ward blocked the attack
      this._spawnDamageNumber(this.playerX, this.playerY - 60, 'BLOCKED', '#4ade80', '14px');
      this._addCombatLog('Ward blocked an attack!', '#4ade80');
      return;
    }

    // Boss charged attack extra feedback
    if (isCharged) {
      this.cameras.main.shake(200, 0.015);
      this._spawnDamageNumber(this.playerX, this.playerY - 80, 'CHARGED!', '#ff4444', '16px');
    }

    // Flash player
    this.playerGfx.setAlpha(0.4);
    this.time.delayedCall(80, () => {
      if (this.playerGfx) this.playerGfx.setAlpha(1);
    });

    // Slight screen shake
    this.cameras.main.shake(100, 0.005);

    // Show damage number on player
    this._spawnDamageNumber(
      this.playerX + Phaser.Math.Between(-15, 15),
      this.playerY - 60,
      `-${damage}`,
      '#e94560',
      '14px'
    );

    this._updatePlayerHealthBar();

    // Emit health update to UIScene
    this.events.emit('playerHealthChanged', {
      health: this.player.health,
      maxHealth: this.player.stats.maxHealth,
    });
  }

  _onEnemyDeath(data) {
    const { gold, isElite, enemyName, isBoss } = data;

    this.runStats.enemiesKilled++;
    this.killCountLabel.setText(`Kills: ${this.runStats.enemiesKilled}`);

    // Add gold to player
    const goldGainBonus = this.player.stats.goldGainBonus || 0;
    const actualGold = Math.round(gold * (1 + goldGainBonus));
    this.player.gold += actualGold;
    this.runStats.goldEarned += actualGold;

    // Gold number floating up
    this._spawnDamageNumber(
      this.enemyX,
      this.enemyY - 80,
      `+${actualGold}g`,
      '#f0c040',
      '13px'
    );

    // Enemy death effect: fade and dissolve
    this.tweens.add({
      targets: this.enemyGfx,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 250,
      onComplete: () => {
        if (this.enemyGfx) {
          this.enemyGfx.setAlpha(1);
          this.enemyGfx.setScale(1);
        }
        // Advance depth every 5 kills
        if (this.runStats.enemiesKilled % 5 === 0) {
          this.currentDepth++;
          this.combatSystem.depth = this.currentDepth;
          if (this.currentDepth > this.player.maxDepthReached) {
            this.player.maxDepthReached = this.currentDepth;
          }
          this.depthLabel.setText(`Depth: ${this.currentDepth}`);

          // Flash the depth label
          this.tweens.add({
            targets: this.depthLabel,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut',
          });

          // Check for Ember Storm trigger
          if (this.emberStorm.checkTrigger(this.currentDepth)) {
            this.emberStorm.startStorm(this.currentDepth);
            this.cameras.main.flash(400, 255, 150, 30);
            this._addCombatLog('A pulse from the Maw... EMBER STORM!', '#ffdd44');
            const stormText = this.add.text(250, 200, 'EMBER STORM!', {
              fontFamily: 'monospace', fontSize: '22px', color: '#ffdd44', fontStyle: 'bold',
            }).setOrigin(0.5).setDepth(20).setAlpha(0);
            stormText.setShadow(0, 0, '#f97316', 8, true, true);
            this.tweens.add({
              targets: stormText, alpha: 1, y: 170, duration: 400, hold: 1500,
              onComplete: () => {
                this.tweens.add({ targets: stormText, alpha: 0, y: 140, duration: 400, onComplete: () => stormText.destroy() });
              },
            });
          }
        }

        // Update enemy display for new enemy
        this._updateEnemyDisplay();
      },
    });

    // Add combat log entry
    this._addCombatLog(`${enemyName} slain! +${actualGold}g`, isElite ? '#f97316' : '#4ade80');

    // Boss defeat celebration
    if (isBoss) {
      this._addCombatLog(`BOSS DEFEATED: ${enemyName}!`, '#ffdd44');
      // Screen flash gold
      this.cameras.main.flash(300, 255, 200, 50);
      // Victory text
      const bossText = this.add.text(250, 200, 'BOSS DEFEATED!', {
        fontFamily: 'monospace', fontSize: '24px', color: '#ffdd44', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(20).setAlpha(0);
      bossText.setShadow(0, 0, '#f97316', 8, true, true);
      this.tweens.add({
        targets: bossText, alpha: 1, y: 170, duration: 400, hold: 1200,
        onComplete: () => {
          this.tweens.add({ targets: bossText, alpha: 0, y: 140, duration: 400, onComplete: () => bossText.destroy() });
        },
      });
    }
  }

  _onLootDrop(data) {
    const { item } = data;

    this.runStats.itemsFound.push(item);

    // Track best item
    if (!this.runStats.bestItem || this._rarityIndex(item.rarity) > this._rarityIndex(this.runStats.bestItem.rarity)) {
      this.runStats.bestItem = item;
    }

    // Emit to UIScene
    this.events.emit('lootDrop', { item });

    // Auto-pause when inventory becomes full to let player manage gear
    if (this.player.isInventoryFull() && !this.isPaused) {
      this.togglePause();
    }

    // Show loot text in combat area
    const color = RARITY_COLORS[item.rarity] || '#ffffff';
    this._addCombatLog(`Loot: ${item.name}`, color);
  }

  _onPlayerDeath(data) {
    this.runStats.died = true;
    this.combatSystem.active = false;

    // Player death visual
    this.tweens.add({
      targets: this.playerGfx,
      alpha: 0,
      duration: 600,
    });

    // Flash screen red
    this.cameras.main.flash(500, 200, 50, 50);

    // "YOU DIED" text
    const deathText = this.add.text(250, 250, 'YOU DIED', {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: '#e94560',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    deathText.setShadow(0, 0, '#e94560', 10, true, true);

    this.tweens.add({
      targets: deathText,
      alpha: 1,
      duration: 500,
    });

    // Transition to PostRunScene after a delay
    this.time.delayedCall(2000, () => {
      this._endRun();
    });
  }

  _onLevelUp(data) {
    this.levelLabel.setText(`Lv.${data.newLevel}`);

    // Flash level label
    this.tweens.add({
      targets: this.levelLabel,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      yoyo: true,
      ease: 'Back.easeOut',
    });

    // Level up notification in combat area
    const lvlText = this.add.text(250, 200, `LEVEL UP! Lv.${data.newLevel}`, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#f0c040',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(15).setAlpha(0);

    this.tweens.add({
      targets: lvlText,
      alpha: 1,
      y: 170,
      duration: 500,
      hold: 800,
      onComplete: () => {
        this.tweens.add({
          targets: lvlText,
          alpha: 0,
          y: 140,
          duration: 400,
          onComplete: () => lvlText.destroy(),
        });
      },
    });

    // Refresh player stats
    const stats = this.player.getComputedStats();
    this.player.stats = stats;
    this.events.emit('statsChanged', stats);
  }

  // ---- Damage numbers ----

  _spawnDamageNumber(x, y, text, color, fontSize) {
    const dmgText = this.add.text(x, y, text, {
      fontFamily: 'monospace',
      fontSize: fontSize || '14px',
      color: color || '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10);

    this.damageNumbers.push({
      text: dmgText,
      life: 0,
      maxLife: 900,
      startY: y,
    });
  }

  _updateDamageNumbers(delta) {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.damageNumbers[i];
      dn.life += delta;
      const progress = dn.life / dn.maxLife;

      // Float upward
      dn.text.setY(dn.startY - 40 * progress);
      // Fade out in second half
      if (progress > 0.5) {
        dn.text.setAlpha(1 - (progress - 0.5) * 2);
      }

      if (dn.life >= dn.maxLife) {
        dn.text.destroy();
        this.damageNumbers.splice(i, 1);
      }
    }
  }

  // ---- Combat log ----

  _addCombatLog(message, color) {
    const maxLogs = 5;

    const logText = this.add.text(250, this.combatLogY, message, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: color || '#aaaacc',
    }).setOrigin(0.5).setDepth(2).setAlpha(0);

    // Fade in
    this.tweens.add({
      targets: logText,
      alpha: 1,
      duration: 200,
    });

    this.combatLogTexts.push(logText);

    // Shift older logs up
    for (let i = 0; i < this.combatLogTexts.length; i++) {
      const idx = this.combatLogTexts.length - 1 - i;
      const target = this.combatLogTexts[idx];
      this.tweens.add({
        targets: target,
        y: this.combatLogY - i * 18,
        duration: 150,
      });
    }

    // Remove old logs
    while (this.combatLogTexts.length > maxLogs) {
      const old = this.combatLogTexts.shift();
      this.tweens.add({
        targets: old,
        alpha: 0,
        duration: 200,
        onComplete: () => old.destroy(),
      });
    }
  }

  // ---- Retreat button ----

  _createRetreatButton() {
    const btnW = 90;
    const btnH = 32;
    const btnX = 450;
    const btnY = 20;

    const g = this.add.graphics().setDepth(8);
    g.fillStyle(0x553333, 1);
    g.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
    g.lineStyle(1, 0xe94560, 0.6);
    g.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);

    const text = this.add.text(btnX, btnY, 'Retreat', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ff8888',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(9);

    const hitArea = this.add.rectangle(btnX, btnY, btnW, btnH)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001)
      .setDepth(10);

    hitArea.on('pointerover', () => {
      text.setColor('#ffffff');
      g.clear();
      g.fillStyle(0x773333, 1);
      g.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
      g.lineStyle(1, 0xe94560, 1);
      g.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
    });

    hitArea.on('pointerout', () => {
      text.setColor('#ff8888');
      g.clear();
      g.fillStyle(0x553333, 1);
      g.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
      g.lineStyle(1, 0xe94560, 0.6);
      g.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
    });

    hitArea.on('pointerdown', () => {
      this.combatSystem.active = false;
      this.runStats.died = false;
      this._endRun();
    });
  }

  // ---- Shard Powers ----

  _useAbility(abilityKey) {
    if (this.isPaused || !this.combatSystem.active) return;
    const result = this.combatSystem.useAbility(abilityKey);
    if (!result) return; // On cooldown or inactive

    switch (result.type) {
      case 'shardBurst':
        // Orange flash + damage number
        this.cameras.main.flash(150, 249, 115, 22, true);
        this._spawnDamageNumber(this.enemyX, this.enemyY - 80, `BURST ${result.data.damage}`, '#f97316', '18px');
        this._updateEnemyDisplay();
        this._addCombatLog('Shard Burst!', '#f97316');
        break;
      case 'threshWard':
        this._spawnDamageNumber(this.playerX, this.playerY - 80, 'WARD x3', '#4ade80', '16px');
        this._addCombatLog("Thresh's Ward activated!", '#4ade80');
        break;
      case 'emberHeal':
        this._spawnDamageNumber(this.playerX, this.playerY - 80, `+${result.data.healAmount} HP`, '#60a5fa', '16px');
        this._updatePlayerHealthBar();
        this.events.emit('playerHealthChanged', { health: this.player.health, maxHealth: this.player.stats.maxHealth });
        this._addCombatLog('Ember Heal!', '#60a5fa');
        break;
    }
  }

  _updateAbilityBar() {
    if (!this.combatSystem || !this.combatSystem.abilities) return;
    for (const [key, ab] of Object.entries(this.combatSystem.abilities)) {
      const btn = this.abilityButtons[key];
      if (!btn) continue;

      const cdRatio = ab.currentCooldown / ab.cooldown;
      btn.cdOverlay.clear();
      if (cdRatio > 0) {
        // Dark sweep overlay covering the icon proportionally
        btn.cdOverlay.fillStyle(0x000000, 1);
        btn.cdOverlay.fillRoundedRect(btn.x, btn.y, btn.w, btn.h * cdRatio, 4);
        btn.cdText.setText(Math.ceil(ab.currentCooldown / 1000)).setVisible(true);
        btn.icon.setAlpha(0.3);
      } else {
        btn.cdText.setVisible(false);
        btn.icon.setAlpha(1);
      }
    }

    // Show ward charges indicator below the icon
    const ward = this.combatSystem.abilities.threshWard;
    const wardBtn = this.abilityButtons.threshWard;
    if (wardBtn) {
      if (ward && ward.charges > 0) {
        wardBtn.nameLabel.setText(`${ward.charges}`).setColor('#4ade80');
      } else {
        wardBtn.nameLabel.setText('W').setColor('#888899');
      }
    }
  }

  _showAbilityTooltip(x, y, def) {
    this._hideAbilityTooltip();
    const container = this.add.container(0, 0).setDepth(60);
    this.abilityTooltip = container;

    const ttW = 170;
    const ttH = 90;
    const ttX = Math.max(10, Math.min(x - ttW / 2, 490 - ttW));
    const ttY = y - ttH - 4;

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1e, 0.95);
    bg.fillRoundedRect(ttX, ttY, ttW, ttH, 6);
    bg.lineStyle(1, def.borderColor, 1);
    bg.strokeRoundedRect(ttX, ttY, ttW, ttH, 6);
    container.add(bg);

    container.add(this.add.text(ttX + 8, ttY + 6, `${def.icon} ${def.name}`, {
      fontFamily: 'monospace', fontSize: '12px', color: def.textColor, fontStyle: 'bold',
    }));

    container.add(this.add.text(ttX + 8, ttY + 24, def.desc, {
      fontFamily: 'monospace', fontSize: '10px', color: '#ccccdd', lineSpacing: 2,
    }));

    container.add(this.add.text(ttX + ttW - 8, ttY + ttH - 14, `CD: ${def.cd}`, {
      fontFamily: 'monospace', fontSize: '9px', color: '#888899',
    }).setOrigin(1, 0));

    container.add(this.add.text(ttX + 8, ttY + ttH - 14, `[${def.hotkey}]`, {
      fontFamily: 'monospace', fontSize: '9px', color: '#f0c040', fontStyle: 'bold',
    }));
  }

  _hideAbilityTooltip() {
    if (this.abilityTooltip) {
      this.abilityTooltip.destroy();
      this.abilityTooltip = null;
    }
  }

  // ---- Pause / manage gear ----

  togglePause() {
    this.isPaused = !this.isPaused;
    this.combatSystem.togglePause();
    this._updatePauseButton();

    if (this.isPaused) {
      // Show pause overlay on combat area
      this.pauseOverlay.clear();
      this.pauseOverlay.fillStyle(0x000000, 0.5);
      this.pauseOverlay.fillRect(0, 0, 500, this.scale.height);
      this.pauseOverlay.setVisible(true);
      this.pauseText.setText('COMBAT PAUSED').setVisible(true);
      this.pauseSubText.setText('Manage your inventory and equipment\nClick RESUME to continue fighting').setVisible(true);
    } else {
      this.pauseOverlay.setVisible(false);
      this.pauseText.setVisible(false);
      this.pauseSubText.setVisible(false);
    }

    // Notify UIScene about pause state
    this.events.emit('pauseToggled', this.isPaused);
  }

  _updatePauseButton() {
    const { height } = this.scale;
    const pauseBtnW = 160;
    const pauseBtnH = 36;
    const pauseBtnX = 250;
    const pauseBtnY = height - 30;

    this.pauseBtnBg.clear();
    if (this.isPaused) {
      this.pauseBtnBg.fillStyle(0x2d5a27, 1);
      this.pauseBtnBg.fillRoundedRect(pauseBtnX - pauseBtnW / 2, pauseBtnY - pauseBtnH / 2, pauseBtnW, pauseBtnH, 8);
      this.pauseBtnBg.lineStyle(2, 0x4ade80, 1);
      this.pauseBtnBg.strokeRoundedRect(pauseBtnX - pauseBtnW / 2, pauseBtnY - pauseBtnH / 2, pauseBtnW, pauseBtnH, 8);
      this.pauseBtnText.setText('▶ RESUME COMBAT').setColor('#4ade80');
    } else {
      this.pauseBtnBg.fillStyle(0x0f3460, 1);
      this.pauseBtnBg.fillRoundedRect(pauseBtnX - pauseBtnW / 2, pauseBtnY - pauseBtnH / 2, pauseBtnW, pauseBtnH, 8);
      this.pauseBtnBg.lineStyle(2, 0xe94560, 1);
      this.pauseBtnBg.strokeRoundedRect(pauseBtnX - pauseBtnW / 2, pauseBtnY - pauseBtnH / 2, pauseBtnW, pauseBtnH, 8);
      this.pauseBtnText.setText('⚔ MANAGE GEAR').setColor('#e94560');
    }
  }

  _drawSpeedBtn(x, y, w, h) {
    this.speedBtnBg.clear();
    const borderColor = this.speedMultiplier === 2 ? 0xf0c040 : 0x555577;
    this.speedBtnBg.fillStyle(0x16213e, 1);
    this.speedBtnBg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    this.speedBtnBg.lineStyle(2, borderColor, 1);
    this.speedBtnBg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);
  }

  // ---- End run ----

  _endRun() {
    // Save current state
    this.player.currentHealth = Math.max(0, this.player.health);
    this.player.totalRuns = (this.player.totalRuns || 0) + 1;

    try {
      saveGame(this.player);
    } catch (_) { /* ignore */ }

    // Store run stats in registry for PostRunScene
    this.registry.set('runStats', {
      ...this.runStats,
      depthReached: this.currentDepth,
      player: this.player.toSaveData(),
    });

    // Stop UIScene
    this.scene.stop('UIScene');

    // Transition
    this.cameras.main.fadeOut(400, 0x1a, 0x1a, 0x2e);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('PostRunScene');
    });
  }

  _autoSave() {
    this.player.currentHealth = Math.max(0, this.player.health);
    try {
      saveGame(this.player);
    } catch (_) { /* ignore */ }
  }

  _rarityIndex(rarity) {
    const order = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    return order.indexOf(rarity);
  }
}
