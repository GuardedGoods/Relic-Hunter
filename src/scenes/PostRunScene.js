import Phaser from 'phaser';
import { RARITY_COLORS, RARITY_ORDER, UPGRADE_TYPES } from '../data/constants.js';
import { Player } from '../models/Player.js';
import { saveGame } from '../systems/SaveSystem.js';
import { getAllUpgrades, applyUpgrade } from '../systems/ProgressionSystem.js';
import { isLoggedIn, submitScore } from '../systems/ApiClient.js';

export class PostRunScene extends Phaser.Scene {
  constructor() {
    super('PostRunScene');
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.fadeIn(400, 0x1a, 0x1a, 0x2e);

    // Retrieve run stats from registry
    const runData = this.registry.get('runStats') || {};
    const died = runData.died || false;
    const depthReached = runData.depthReached || 0;
    const enemiesKilled = runData.enemiesKilled || 0;
    const goldEarned = runData.goldEarned || 0;
    const itemsFound = runData.itemsFound || [];
    const bestItem = runData.bestItem || null;
    const playerSaveData = runData.player || null;

    // Reconstruct player for saving and upgrades
    this.player = playerSaveData ? Player.fromSaveData(playerSaveData) : new Player();

    // ---- Background gradient ----
    const bg = this.add.graphics();
    for (let y = 0; y < height; y++) {
      const t = y / height;
      const r = Phaser.Math.Linear(0x1a, 0x0f, t);
      const g = Phaser.Math.Linear(0x1a, 0x10, t);
      const b = Phaser.Math.Linear(0x2e, 0x20, t);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      bg.fillRect(0, y, width, 1);
    }
    bg.setDepth(0);

    // ---- Floating particles ----
    this.particles = [];
    for (let i = 0; i < 20; i++) {
      const px = Phaser.Math.Between(0, width);
      const py = Phaser.Math.Between(0, height);
      const gfx = this.add.graphics();
      const size = Phaser.Math.FloatBetween(1, 2.5);
      gfx.fillStyle(0x4444aa, Phaser.Math.FloatBetween(0.1, 0.3));
      gfx.fillCircle(0, 0, size);
      gfx.setPosition(px, py).setDepth(1);
      this.particles.push({
        graphic: gfx,
        speed: Phaser.Math.FloatBetween(0.15, 0.4),
        x: px, y: py, maxY: height, maxX: width,
      });
    }

    // ---- Header ----
    const headerText = died ? 'YOU DIED' : 'RUN COMPLETE';
    const headerColor = died ? '#e94560' : '#4ade80';

    const header = this.add.text(width / 2, 50, headerText, {
      fontFamily: 'monospace',
      fontSize: '42px',
      color: headerColor,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5);
    header.setShadow(0, 0, headerColor, 10, true, true);

    // Pulse
    this.tweens.add({
      targets: header,
      alpha: { from: 0.7, to: 1 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ---- Summary panel ----
    const panelW = 500;
    const panelH = 410;
    const panelX = (width - panelW) / 2;
    const panelY = 100;

    const panelBg = this.add.graphics().setDepth(3);
    panelBg.fillStyle(0x16213e, 0.95);
    panelBg.fillRoundedRect(panelX, panelY, panelW, panelH, 10);
    panelBg.lineStyle(2, 0x333355, 1);
    panelBg.strokeRoundedRect(panelX, panelY, panelW, panelH, 10);

    let sy = panelY + 20;
    const leftX = panelX + 30;
    const valueX = panelX + panelW - 30;

    // Depth reached
    this._addStatRow(leftX, valueX, sy, 'Depth Reached', `${depthReached}`, '#ffffff');
    sy += 36;

    // Enemies killed
    this._addStatRow(leftX, valueX, sy, 'Enemies Killed', `${enemiesKilled}`, '#ffffff');
    sy += 36;

    // Gold earned
    this._addStatRow(leftX, valueX, sy, 'Gold Earned', `${goldEarned}`, '#f0c040');
    sy += 36;

    // Total gold
    this._addStatRow(leftX, valueX, sy, 'Total Gold', `${this.player.gold}`, '#f0c040');
    sy += 36;

    // Items found by rarity
    const rarityCounts = {};
    for (const item of itemsFound) {
      rarityCounts[item.rarity] = (rarityCounts[item.rarity] || 0) + 1;
    }
    this._addStatRow(leftX, valueX, sy, 'Items Found', `${itemsFound.length}`, '#aaaacc');
    sy += 28;

    // Rarity breakdown
    const breakdownParts = [];
    for (const r of RARITY_ORDER) {
      if (rarityCounts[r]) {
        breakdownParts.push({ rarity: r, count: rarityCounts[r] });
      }
    }

    if (breakdownParts.length > 0) {
      const breakdownX = leftX + 20;
      for (const part of breakdownParts) {
        const rarityColor = RARITY_COLORS[part.rarity] || '#ffffff';
        this.add.text(breakdownX, sy, `${part.rarity}: ${part.count}`, {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: rarityColor,
        }).setDepth(5);
        sy += 18;
      }
    }
    sy += 10;

    // Killed By (only if died)
    if (died && runData.killedBy) {
      this._addStatRow(leftX, valueX, sy, 'Killed By:', `${runData.killedBy}`, '#e94560');
      sy += 36;
    }

    // Highest Hit
    this._addStatRow(leftX, valueX, sy, 'Highest Hit:', `${runData.highestDamage || 0}`, '#f97316');
    sy += 36;

    // Best item found
    if (bestItem) {
      const bestColor = RARITY_COLORS[bestItem.rarity] || '#ffffff';
      this.add.text(leftX, sy, 'Best Item:', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#aaaacc',
      }).setDepth(5);

      this.add.text(valueX, sy, bestItem.name, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: bestColor,
        fontStyle: 'bold',
      }).setOrigin(1, 0).setDepth(5);

      this.add.text(valueX, sy + 18, `${bestItem.rarity.toUpperCase()} ${bestItem.slot.toUpperCase()}`, {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#888899',
      }).setOrigin(1, 0).setDepth(5);
    }

    // ---- Buttons ----
    const btnY = panelY + panelH + 30;

    // New Run button
    this._createButton(width / 2 - 140, btnY, 200, 48, 'New Run', 0xe94560, () => {
      this.cameras.main.fadeOut(300, 0x1a, 0x1a, 0x2e);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });

    // Upgrades button
    this._createButton(width / 2 + 140, btnY, 200, 48, 'Upgrades', 0x16213e, () => {
      this._showUpgradePanel();
    });

    // Leaderboard button
    this._createButton(width / 2, btnY + 60, 200, 48, 'Leaderboard', 0x16213e, () => {
      this.cameras.main.fadeOut(300, 0x1a, 0x1a, 0x2e);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
        // Leaderboard will be accessible from main menu
      });
    });

    // ---- Auto-save ----
    try {
      // Heal player to full for next run
      const stats = this.player.getComputedStats();
      this.player.currentHealth = stats.maxHealth;
      saveGame(this.player);
    } catch (_) { /* ignore */ }

    // Submit score to leaderboard
    if (isLoggedIn()) {
      submitScore({
        depth: depthReached || 0,
        kills: enemiesKilled || 0,
        gold: goldEarned || 0,
        zone: this.registry.get('selectedZone') || 'ashveil',
        durationSeconds: Math.round((Date.now() - (runData.startTime || Date.now())) / 1000),
        died: died || false,
        killedBy: runData.killedBy || '',
        highestDamage: runData.highestDamage || 0,
        class: this.registry.get('classId') || 'slayer',
        level: runData.level || 1,
      });

      this.add.text(width / 2, 85, 'Score submitted to leaderboard!', {
        fontFamily: 'monospace', fontSize: '15px', color: '#4ade80',
      }).setOrigin(0.5).setDepth(5);
    }

    // Upgrade panel state
    this.upgradePanel = null;
  }

  update(_time, delta) {
    if (this.particles) {
      for (const p of this.particles) {
        p.y -= p.speed * (delta / 16);
        if (p.y < -10) {
          p.y = p.maxY + 10;
          p.x = Phaser.Math.Between(0, p.maxX);
        }
        p.graphic.setPosition(p.x, p.y);
      }
    }
  }

  _addStatRow(leftX, rightX, y, label, value, valueColor) {
    this.add.text(leftX, y, label, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#aaaacc',
    }).setDepth(5);

    this.add.text(rightX, y, value, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: valueColor || '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(5);

    // Separator line
    const sep = this.add.graphics().setDepth(4);
    sep.lineStyle(1, 0x333355, 0.5);
    sep.lineBetween(leftX, y + 26, rightX, y + 26);
  }

  _createButton(x, y, w, h, label, bgColor, onClick) {
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(bgColor, 1);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    g.lineStyle(2, 0xe94560, 0.6);
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);

    const text = this.add.text(x, y, label, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6);

    const hitArea = this.add.rectangle(x, y, w, h)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001)
      .setDepth(7);

    hitArea.on('pointerover', () => {
      text.setScale(1.05);
      g.clear();
      g.fillStyle(bgColor, 1);
      g.fillRoundedRect(x - w / 2 - 2, y - h / 2 - 2, w + 4, h + 4, 10);
      g.lineStyle(2, 0xe94560, 1);
      g.strokeRoundedRect(x - w / 2 - 2, y - h / 2 - 2, w + 4, h + 4, 10);
    });

    hitArea.on('pointerout', () => {
      text.setScale(1);
      g.clear();
      g.fillStyle(bgColor, 1);
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
      g.lineStyle(2, 0xe94560, 0.6);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    });

    hitArea.on('pointerdown', onClick);

    return { graphics: g, text, hitArea };
  }

  _showUpgradePanel() {
    if (this.upgradePanel) return;

    const { width, height } = this.scale;
    const panelW = 600;
    const panelH = 460;
    const panelX = (width - panelW) / 2;
    const panelY = (height - panelH) / 2;

    const container = this.add.container(0, 0).setDepth(20);
    this.upgradePanel = container;

    // Backdrop
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(0);
    container.add(overlay);

    // Panel background
    const panelBg = this.add.graphics().setDepth(1);
    panelBg.fillStyle(0x16213e, 1);
    panelBg.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    panelBg.lineStyle(2, 0xe94560, 0.8);
    panelBg.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    container.add(panelBg);

    // Title
    container.add(this.add.text(width / 2, panelY + 30, 'UPGRADES', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#e94560',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2));

    // Gold
    container.add(this.add.text(width / 2, panelY + 60, `Gold: ${this.player.gold}`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#f0c040',
    }).setOrigin(0.5).setDepth(2));

    // Get upgrades
    const upgrades = getAllUpgrades(this.player);
    const rowStartY = panelY + 100;
    const rowH = 65;

    upgrades.forEach((upg, i) => {
      const ry = rowStartY + i * rowH;

      // Row background
      const rowBg = this.add.graphics().setDepth(1);
      rowBg.fillStyle(0x0f3460, 0.5);
      rowBg.fillRoundedRect(panelX + 20, ry, panelW - 40, rowH - 8, 6);
      container.add(rowBg);

      // Label
      container.add(this.add.text(panelX + 35, ry + 10, upg.label, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
      }).setDepth(2));

      // Level
      container.add(this.add.text(panelX + 35, ry + 32, `Level: ${upg.currentLevel} / ${upg.maxLevel}`, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#aaaacc',
      }).setDepth(2));

      // Bonus display
      const isPercent = upg.type === UPGRADE_TYPES.DROP_RATE || upg.type === UPGRADE_TYPES.GOLD_GAIN;
      const bonusStr = isPercent
        ? `+${(upg.currentValue * 100).toFixed(0)}%`
        : `+${upg.currentValue}`;
      container.add(this.add.text(panelX + 280, ry + 20, bonusStr, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#4ade80',
      }).setOrigin(0.5).setDepth(2));

      // Buy button
      const maxed = upg.currentLevel >= upg.maxLevel;
      const canAfford = upg.canAfford;
      const btnW = 120;
      const btnH2 = 36;
      const btnX = panelX + panelW - 30 - btnW;
      const btnY2 = ry + (rowH - 8) / 2 - btnH2 / 2;

      const btnG = this.add.graphics().setDepth(2);
      const btnColor = maxed ? 0x333355 : (canAfford ? 0x2a7a2a : 0x553333);
      btnG.fillStyle(btnColor, 1);
      btnG.fillRoundedRect(btnX, btnY2, btnW, btnH2, 6);
      container.add(btnG);

      const btnLabel = maxed ? 'MAXED' : `${upg.cost} g`;
      container.add(this.add.text(btnX + btnW / 2, btnY2 + btnH2 / 2, btnLabel, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: maxed ? '#666666' : (canAfford ? '#ffffff' : '#aa6666'),
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(3));

      if (!maxed) {
        const btnHit = this.add.rectangle(btnX + btnW / 2, btnY2 + btnH2 / 2, btnW, btnH2)
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: canAfford })
          .setAlpha(0.001)
          .setDepth(4);
        container.add(btnHit);

        btnHit.on('pointerdown', () => {
          const applied = applyUpgrade(this.player, upg.type);
          if (applied) {
            try {
              saveGame(this.player);
            } catch (_) { /* ignore */ }

            this._destroyUpgradePanel();
            this._showUpgradePanel();
          }
        });
      }
    });

    // Close button
    const closeBtnW = 120;
    const closeBtnH = 40;
    const closeBtnX = width / 2 - closeBtnW / 2;
    const closeBtnY = panelY + panelH - 55;

    const closeBtnG = this.add.graphics().setDepth(2);
    closeBtnG.fillStyle(0xe94560, 1);
    closeBtnG.fillRoundedRect(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 8);
    container.add(closeBtnG);

    container.add(this.add.text(width / 2, closeBtnY + closeBtnH / 2, 'Close', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3));

    const closeHit = this.add.rectangle(width / 2, closeBtnY + closeBtnH / 2, closeBtnW, closeBtnH)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001)
      .setDepth(4);
    container.add(closeHit);

    closeHit.on('pointerdown', () => {
      this._destroyUpgradePanel();
    });
  }

  _destroyUpgradePanel() {
    if (this.upgradePanel) {
      this.upgradePanel.destroy();
      this.upgradePanel = null;
    }
  }
}
