import Phaser from 'phaser';
import { Player } from '../models/Player.js';
import { CombatSystem } from '../systems/CombatSystem.js';
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
      startDepth: this.player.maxDepthReached,
      died: false,
    };

    this.currentDepth = this.player.maxDepthReached;

    // ---- Combat system ----
    this.combatSystem = new CombatSystem();
    this.combatSystem.startCombat(this.player, this.zoneData.id, this.currentDepth);

    // ---- Draw combat area background (left side: 0-500px) ----
    const combatBg = this.add.graphics();
    combatBg.fillStyle(0x12122a, 1);
    combatBg.fillRect(0, 0, 500, height);
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

    // ---- Shard Powers (ability bar) ----
    this.abilityButtons = {};
    const abilityDefs = [
      { key: 'shardBurst', label: 'Q: Shard Burst', hotkey: 'Q', color: 0xf97316, textColor: '#f97316' },
      { key: 'threshWard', label: "W: Thresh's Ward", hotkey: 'W', color: 0x4ade80, textColor: '#4ade80' },
      { key: 'emberHeal', label: 'E: Ember Heal', hotkey: 'E', color: 0x60a5fa, textColor: '#60a5fa' },
    ];

    const abBarY = height - 70;
    const abBtnW = 140;
    const abBtnH = 28;
    const abStartX = 30;
    const abGap = 8;

    abilityDefs.forEach((def, i) => {
      const ax = abStartX + i * (abBtnW + abGap);

      const bg = this.add.graphics().setDepth(8);
      bg.fillStyle(0x16213e, 1);
      bg.fillRoundedRect(ax, abBarY, abBtnW, abBtnH, 5);
      bg.lineStyle(1, def.color, 0.8);
      bg.strokeRoundedRect(ax, abBarY, abBtnW, abBtnH, 5);

      const label = this.add.text(ax + abBtnW / 2, abBarY + abBtnH / 2, def.label, {
        fontFamily: 'monospace', fontSize: '10px', color: def.textColor, fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(9);

      // Cooldown overlay (fills from left, semi-transparent dark)
      const cdOverlay = this.add.graphics().setDepth(9).setAlpha(0.6);

      // Cooldown text
      const cdText = this.add.text(ax + abBtnW / 2, abBarY + abBtnH / 2, '', {
        fontFamily: 'monospace', fontSize: '11px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(10).setVisible(false);

      const hitArea = this.add.rectangle(ax + abBtnW / 2, abBarY + abBtnH / 2, abBtnW, abBtnH)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.001).setDepth(11);

      hitArea.on('pointerdown', () => this._useAbility(def.key));

      this.abilityButtons[def.key] = { bg, label, cdOverlay, cdText, x: ax, y: abBarY, w: abBtnW, h: abBtnH, color: def.color };

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
    this.player.dropRateBonus = stats.dropRateBonus || 0;

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
    g.clear();
    // Body (colored rectangle)
    g.fillStyle(0x4ade80, 1);
    g.fillRect(this.playerX - 25, this.playerY - 35, 50, 70);
    // Outline
    g.lineStyle(2, 0x22aa55, 1);
    g.strokeRect(this.playerX - 25, this.playerY - 35, 50, 70);
    // Head (circle)
    g.fillStyle(0x66dd99, 1);
    g.fillCircle(this.playerX, this.playerY - 45, 14);
    g.lineStyle(1, 0x22aa55, 1);
    g.strokeCircle(this.playerX, this.playerY - 45, 14);
    // Weapon line
    g.lineStyle(3, 0xcccccc, 1);
    g.lineBetween(this.playerX + 25, this.playerY - 10, this.playerX + 40, this.playerY - 30);
  }

  _drawEnemy() {
    const g = this.enemyGfx;
    g.clear();
    const enemy = this.combatSystem.enemy;
    if (!enemy) return;

    const isBoss = enemy.isBoss || false;
    const scale = isBoss ? 1.4 : 1;
    const baseColor = isBoss ? 0xffdd44 : (enemy.isElite ? 0xf97316 : 0xe94560);
    const outlineColor = isBoss ? 0xcc9900 : (enemy.isElite ? 0xcc5500 : 0xbb2244);

    const bw = 50 * scale;
    const bh = 70 * scale;
    const headR = 14 * scale;

    // Body
    g.fillStyle(baseColor, 1);
    g.fillRect(this.enemyX - bw / 2, this.enemyY - bh / 2, bw, bh);
    g.lineStyle(2, outlineColor, 1);
    g.strokeRect(this.enemyX - bw / 2, this.enemyY - bh / 2, bw, bh);
    // Head
    g.fillStyle(baseColor, 0.8);
    g.fillCircle(this.enemyX, this.enemyY - bh / 2 - headR + 2, headR);
    g.lineStyle(1, outlineColor, 1);
    g.strokeCircle(this.enemyX, this.enemyY - bh / 2 - headR + 2, headR);
    // Eyes
    g.fillStyle(isBoss ? 0xff0000 : 0xffffff, 1);
    g.fillCircle(this.enemyX - 5 * scale, this.enemyY - bh / 2 - headR, 3 * scale);
    g.fillCircle(this.enemyX + 5 * scale, this.enemyY - bh / 2 - headR, 3 * scale);
    g.fillStyle(0x000000, 1);
    g.fillCircle(this.enemyX - 5 * scale, this.enemyY - bh / 2 - headR, 1.5 * scale);
    g.fillCircle(this.enemyX + 5 * scale, this.enemyY - bh / 2 - headR, 1.5 * scale);
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
        btn.cdOverlay.fillStyle(0x000000, 1);
        btn.cdOverlay.fillRoundedRect(btn.x, btn.y, btn.w * cdRatio, btn.h, 5);
        btn.cdText.setText(Math.ceil(ab.currentCooldown / 1000) + 's').setVisible(true);
        btn.label.setAlpha(0.4);
      } else {
        btn.cdText.setVisible(false);
        btn.label.setAlpha(1);
      }
    }

    // Show ward charges indicator
    const ward = this.combatSystem.abilities.threshWard;
    if (ward && ward.charges > 0) {
      const btn = this.abilityButtons.threshWard;
      if (btn) {
        btn.label.setText(`W: Ward [${ward.charges}]`);
      }
    } else {
      const btn = this.abilityButtons.threshWard;
      if (btn) btn.label.setText("W: Thresh's Ward");
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
