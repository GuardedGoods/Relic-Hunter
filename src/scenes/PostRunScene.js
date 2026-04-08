import Phaser from 'phaser';
import { RARITY_COLORS, RARITY_ORDER, UPGRADE_TYPES } from '../data/constants.js';
import { Player } from '../models/Player.js';
import { saveGame } from '../systems/SaveSystem.js';
import { getAllUpgrades, applyUpgrade } from '../systems/ProgressionSystem.js';

/**
 * PostRunScene - Displayed after a run ends (death or retreat).
 * Shows run summary, lets player buy upgrades, then return to menu.
 */
export class PostRunScene extends Phaser.Scene {
  constructor() {
    super('PostRunScene');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.fadeIn(400, 0x1a, 0x1a, 0x2e);

    // Background gradient
    const bg = this.add.graphics();
    for (let y = 0; y < height; y++) {
      const t = y / height;
      const r = Phaser.Math.Linear(0x1a, 0x0a, t);
      const g = Phaser.Math.Linear(0x1a, 0x0a, t);
      const b = Phaser.Math.Linear(0x2e, 0x1e, t);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      bg.fillRect(0, y, width, 1);
    }

    // Floating particles
    this.particles = [];
    for (let i = 0; i < 20; i++) {
      const dot = this.add.graphics();
      const size = Phaser.Math.FloatBetween(1, 2.5);
      dot.fillStyle(0x4444aa, Phaser.Math.FloatBetween(0.1, 0.3));
      dot.fillCircle(0, 0, size);
      const dx = Phaser.Math.Between(0, width);
      const dy = Phaser.Math.Between(0, height);
      dot.setPosition(dx, dy).setDepth(0);
      this.particles.push({ g: dot, speed: Phaser.Math.FloatBetween(0.15, 0.4), x: dx, y: dy });
    }

    // ---- Get run stats from registry ----
    const runStats = this.registry.get('runStats') || {};
    const died = runStats.died || false;
    const depthReached = runStats.depthReached || 0;
    const enemiesKilled = runStats.enemiesKilled || 0;
    const goldEarned = runStats.goldEarned || 0;
    const itemsFound = runStats.itemsFound || [];
    const bestItem = runStats.bestItem || null;

    // Load player from save
    let player;
    if (runStats.player) {
      player = Player.fromSaveData(runStats.player);
    } else {
      player = new Player();
    }
    this.player = player;

    // Save immediately
    try { saveGame(player); } catch (_) { /* ignore */ }

    // ---- Header ----
    const headerText = died ? 'YOU DIED' : 'RUN COMPLETE';
    const headerColor = died ? '#e94560' : '#4ade80';

    const header = this.add.text(width / 2, 50, headerText, {
      fontFamily: 'monospace', fontSize: '40px', color: headerColor, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5);
    header.setShadow(0, 0, headerColor, 10, true, true);

    // Subtle pulse
    this.tweens.add({
      targets: header,
      alpha: { from: 1, to: 0.7 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // ---- Stats panel ----
    const panelW = 400;
    const panelH = 290;
    const panelX = (width - panelW) / 2;
    const panelY = 100;

    const panelBg = this.add.graphics().setDepth(1);
    panelBg.fillStyle(0x16213e, 0.9);
    panelBg.fillRoundedRect(panelX, panelY, panelW, panelH, 10);
    panelBg.lineStyle(2, 0x333355, 0.8);
    panelBg.strokeRoundedRect(panelX, panelY, panelW, panelH, 10);

    const statLineH = 30;
    let lineY = panelY + 20;

    // Depth reached
    this._addStatLine(panelX + 25, lineY, 'Depth Reached', `${depthReached}`, '#60a5fa');
    lineY += statLineH;

    // Enemies killed
    this._addStatLine(panelX + 25, lineY, 'Enemies Killed', `${enemiesKilled}`, '#4ade80');
    lineY += statLineH;

    // Gold earned
    this._addStatLine(panelX + 25, lineY, 'Gold Earned', `${goldEarned}`, '#f0c040');
    lineY += statLineH;

    // Total gold
    this._addStatLine(panelX + 25, lineY, 'Total Gold', `${player.gold}`, '#f0c040');
    lineY += statLineH;

    // Items found by rarity
    const rarityCounts = {};
    for (const item of itemsFound) {
      rarityCounts[item.rarity] = (rarityCounts[item.rarity] || 0) + 1;
    }
    const itemsStr = RARITY_ORDER
      .filter(r => rarityCounts[r])
      .map(r => `${rarityCounts[r]} ${r}`)
      .join(', ') || 'None';
    this._addStatLine(panelX + 25, lineY, 'Items Found', itemsStr, '#aaaacc');
    lineY += statLineH;

    // Best item
    if (bestItem) {
      lineY += 10;
      this.add.text(panelX + 25, lineY, 'Best Find:', {
        fontFamily: 'monospace', fontSize: '12px', color: '#888899',
      }).setDepth(2);

      this.add.text(panelX + panelW - 25, lineY, bestItem.name, {
        fontFamily: 'monospace', fontSize: '13px',
        color: RARITY_COLORS[bestItem.rarity] || '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(1, 0).setDepth(2);

      lineY += 20;
      if (bestItem.affixes) {
        bestItem.affixes.forEach(affix => {
          const affixLabel = affix.label.replace('{v}', String(affix.value));
          this.add.text(panelX + 40, lineY, affixLabel, {
            fontFamily: 'monospace', fontSize: '10px', color: '#ccccdd',
          }).setDepth(2);
          lineY += 14;
        });
      }
    }

    // ---- Buttons ----
    const btnY = 440;

    // Upgrades button
    this._createButton(width / 2 - 120, btnY, 200, 48, 'Upgrades', 0x16213e, () => {
      this._showUpgradePanel();
    });

    // New Run button
    this._createButton(width / 2 + 120, btnY, 200, 48, 'New Run', 0xe94560, () => {
      // Reset health for new run
      this.player.currentHealth = this.player.getComputedStats().maxHealth;
      try { saveGame(this.player); } catch (_) { /* ignore */ }
      this.cameras.main.fadeOut(300, 0x1a, 0x1a, 0x2e);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });

    // ---- Upgrade panel ----
    this.upgradePanel = null;
  }

  update(_time, delta) {
    // Animate particles
    for (const p of this.particles) {
      p.y -= p.speed * (delta / 16);
      if (p.y < -10) {
        p.y = 650;
        p.x = Phaser.Math.Between(0, 960);
      }
      p.g.setPosition(p.x, p.y);
    }
  }

  _addStatLine(x, y, label, value, valueColor) {
    this.add.text(x, y, label, {
      fontFamily: 'monospace', fontSize: '14px', color: '#888899',
    }).setDepth(2);

    this.add.text(x + 350, y, value, {
      fontFamily: 'monospace', fontSize: '14px', color: valueColor || '#ffffff',
    }).setOrigin(1, 0).setDepth(2);
  }

  _createButton(x, y, w, h, label, bgColor, onClick) {
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(bgColor, 1);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    g.lineStyle(2, 0xe94560, 0.6);
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);

    const text = this.add.text(x, y, label, {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6);

    const hitArea = this.add.rectangle(x, y, w, h)
      .setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0.001).setDepth(7);

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
      .setOrigin(0.5).setInteractive().setDepth(0);
    container.add(overlay);

    // Panel
    const panelBg = this.add.graphics().setDepth(1);
    panelBg.fillStyle(0x16213e, 1);
    panelBg.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    panelBg.lineStyle(2, 0xe94560, 0.8);
    panelBg.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    container.add(panelBg);

    // Title
    const titleText = this.add.text(width / 2, panelY + 30, 'UPGRADES', {
      fontFamily: 'monospace', fontSize: '28px', color: '#e94560', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);
    container.add(titleText);

    // Gold
    const goldText = this.add.text(width / 2, panelY + 60, `Gold: ${this.player.gold}`, {
      fontFamily: 'monospace', fontSize: '16px', color: '#f0c040',
    }).setOrigin(0.5).setDepth(2);
    container.add(goldText);

    // Upgrades
    const upgrades = getAllUpgrades(this.player);
    const rowStartY = panelY + 100;
    const rowH = 65;

    upgrades.forEach((upg, i) => {
      const ry = rowStartY + i * rowH;

      const rowBg = this.add.graphics().setDepth(1);
      rowBg.fillStyle(0x0f3460, 0.5);
      rowBg.fillRoundedRect(panelX + 20, ry, panelW - 40, rowH - 8, 6);
      container.add(rowBg);

      const labelText = this.add.text(panelX + 35, ry + 10, upg.label, {
        fontFamily: 'monospace', fontSize: '16px', color: '#ffffff',
      }).setDepth(2);
      container.add(labelText);

      const levelText = this.add.text(panelX + 35, ry + 32, `Level: ${upg.currentLevel} / ${upg.maxLevel}`, {
        fontFamily: 'monospace', fontSize: '12px', color: '#aaaacc',
      }).setDepth(2);
      container.add(levelText);

      const isPercent = upg.type === UPGRADE_TYPES.DROP_RATE || upg.type === UPGRADE_TYPES.GOLD_GAIN;
      const bonusStr = isPercent ? `+${(upg.currentValue * 100).toFixed(0)}%` : `+${upg.currentValue}`;
      const bonusText = this.add.text(panelX + 280, ry + 20, bonusStr, {
        fontFamily: 'monospace', fontSize: '14px', color: '#4ade80',
      }).setOrigin(0.5).setDepth(2);
      container.add(bonusText);

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
      const btnText = this.add.text(btnX + btnW / 2, btnY2 + btnH2 / 2, btnLabel, {
        fontFamily: 'monospace', fontSize: '13px',
        color: maxed ? '#666666' : (canAfford ? '#ffffff' : '#aa6666'),
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(3);
      container.add(btnText);

      if (!maxed) {
        const btnHit = this.add.rectangle(btnX + btnW / 2, btnY2 + btnH2 / 2, btnW, btnH2)
          .setOrigin(0.5).setInteractive({ useHandCursor: canAfford }).setAlpha(0.001).setDepth(4);
        container.add(btnHit);

        btnHit.on('pointerdown', () => {
          const applied = applyUpgrade(this.player, upg.type);
          if (applied) {
            try { saveGame(this.player); } catch (_) { /* ignore */ }
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

    const closeText = this.add.text(width / 2, closeBtnY + closeBtnH / 2, 'Close', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3);
    container.add(closeText);

    const closeHit = this.add.rectangle(width / 2, closeBtnY + closeBtnH / 2, closeBtnW, closeBtnH)
      .setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0.001).setDepth(4);
    container.add(closeHit);

    closeHit.on('pointerdown', () => this._destroyUpgradePanel());
  }

  _destroyUpgradePanel() {
    if (this.upgradePanel) {
      this.upgradePanel.destroy();
      this.upgradePanel = null;
    }
  }
}
