import Phaser from 'phaser';
import { RARITY_COLORS, RARITY_ORDER, UPGRADE_TYPES } from '../data/constants.js';
import { Player } from '../models/Player.js';
import { saveGame } from '../systems/SaveSystem.js';
import { getAllUpgrades, applyUpgrade } from '../systems/ProgressionSystem.js';
import { isLoggedIn, getUsername, submitScore, getLeaderboard } from '../systems/ApiClient.js';

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
      this._showLeaderboard();
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

  async _showLeaderboard() {
    if (this.lbPanel) return;
    const w = this.scale.width;
    const h = this.scale.height;
    const container = this.add.container(0, 0).setDepth(50);
    this.lbPanel = container;

    const backdrop = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7).setInteractive();
    container.add(backdrop);
    backdrop.on('pointerdown', () => { container.destroy(); this.lbPanel = null; });

    const pw = 700, ph = 480;
    const px = w / 2 - pw / 2, py = h / 2 - ph / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1e, 0.98);
    bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(2, 0xf97316, 0.8);
    bg.strokeRoundedRect(px, py, pw, ph, 10);
    container.add(bg);

    container.add(this.add.text(w / 2, py + 20, 'LEADERBOARD', {
      fontFamily: 'monospace', fontSize: '16px', color: '#f97316', fontStyle: 'bold',
    }).setOrigin(0.5));

    const headerY = py + 45;
    const cols = [px + 10, px + 30, px + 130, px + 190, px + 220, px + 265, px + 310, px + 375, px + 450];
    const headers = ['#', 'Player', 'Cls', 'Lv', 'Dpth', 'Kills', 'Hit', 'Killed By', 'Date'];
    headers.forEach((hdr, i) => {
      container.add(this.add.text(cols[i], headerY, hdr, {
        fontFamily: 'monospace', fontSize: '10px', color: '#888899', fontStyle: 'bold',
      }));
    });

    const loading = this.add.text(w / 2, py + ph / 2, 'Loading...', {
      fontFamily: 'monospace', fontSize: '14px', color: '#aaaacc',
    }).setOrigin(0.5);
    container.add(loading);

    const entries = await getLeaderboard();
    loading.destroy();

    if (entries.length === 0) {
      container.add(this.add.text(w / 2, py + ph / 2, 'No scores yet!', {
        fontFamily: 'monospace', fontSize: '11px', color: '#888899',
      }).setOrigin(0.5));
    } else {
      entries.slice(0, 20).forEach((entry, i) => {
        const ey = headerY + 22 + i * 16;
        const isMe = isLoggedIn() && entry.username === getUsername();
        const rowColor = isMe ? '#f0c040' : '#ccccdd';
        const fs = '9px';
        container.add(this.add.text(cols[0], ey, `${entry.rank}`, { fontFamily: 'monospace', fontSize: fs, color: i < 3 ? '#f97316' : rowColor }));
        container.add(this.add.text(cols[1], ey, entry.username, { fontFamily: 'monospace', fontSize: fs, color: rowColor }));
        container.add(this.add.text(cols[2], ey, entry.class || 'slayer', { fontFamily: 'monospace', fontSize: fs, color: '#c084fc' }));
        container.add(this.add.text(cols[3], ey, `${entry.level || 1}`, { fontFamily: 'monospace', fontSize: fs, color: '#f0c040' }));
        container.add(this.add.text(cols[4], ey, `${entry.depth}`, { fontFamily: 'monospace', fontSize: fs, color: rowColor }));
        container.add(this.add.text(cols[5], ey, `${entry.kills}`, { fontFamily: 'monospace', fontSize: fs, color: rowColor }));
        container.add(this.add.text(cols[6], ey, `${entry.highest_damage || 0}`, { fontFamily: 'monospace', fontSize: fs, color: '#f97316' }));
        container.add(this.add.text(cols[7], ey, entry.killed_by || '--', { fontFamily: 'monospace', fontSize: fs, color: entry.killed_by ? '#e94560' : '#555566' }));
        container.add(this.add.text(cols[8], ey, entry.date || '', { fontFamily: 'monospace', fontSize: fs, color: '#666677' }));
      });
    }

    const closeBtn = this.add.text(w / 2, py + ph - 20, 'Close', {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffffff', fontStyle: 'bold',
      backgroundColor: '#333355', padding: { x: 20, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    container.add(closeBtn);
    closeBtn.on('pointerdown', () => { container.destroy(); this.lbPanel = null; });
  }
}
