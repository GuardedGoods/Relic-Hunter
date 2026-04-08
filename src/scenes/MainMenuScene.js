import Phaser from 'phaser';
import { UPGRADE_TYPES, UPGRADE_CONFIG, ZONES } from '../data/constants.js';
import { getAvailableZones } from '../systems/ZoneSystem.js';
import { hasSave, loadGame, saveGame } from '../systems/SaveSystem.js';
import { getAllUpgrades, applyUpgrade } from '../systems/ProgressionSystem.js';
import { Player } from '../models/Player.js';
import { isLoggedIn, getUsername, login, register, logout, getLeaderboard } from '../systems/ApiClient.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.fadeIn(400, 0x1a, 0x1a, 0x2e);

    // ---- Background gradient ----
    const bg = this.add.graphics();
    for (let y = 0; y < height; y++) {
      const t = y / height;
      const r = Phaser.Math.Linear(0x1a, 0x0f, t);
      const g = Phaser.Math.Linear(0x1a, 0x10, t);
      const b = Phaser.Math.Linear(0x2e, 0x30, t);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      bg.fillRect(0, y, width, 1);
    }
    bg.setDepth(0);

    // ---- Floating particles ----
    this._createParticles(width, height);

    // ---- Title ----
    this.titleText = this.add.text(width / 2, 80, 'RELIC HUNTER', {
      fontFamily: 'monospace',
      fontSize: '56px',
      color: '#e94560',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5);

    // Subtle pulse animation on title
    this.tweens.add({
      targets: this.titleText,
      alpha: { from: 1, to: 0.7 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Glow effect via shadow
    this.titleText.setShadow(0, 0, '#e94560', 12, true, true);

    // Subtitle
    this.add.text(width / 2, 135, 'Loot-Focused Micro RPG', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#8888aa',
    }).setOrigin(0.5).setDepth(5);

    // ---- Load save state ----
    this._hasSave = false;
    this.playerGold = 0;
    this.maxDepth = 0;
    this.savedPlayer = null;

    try {
      this._hasSave = hasSave();
      if (this._hasSave) {
        const saveData = loadGame();
        if (saveData) {
          this.playerGold = saveData.gold || 0;
          this.maxDepth = saveData.maxDepthReached || 0;
          this.savedPlayer = saveData;
        }
      }
    } catch (_) {
      // SaveSystem not yet available
    }

    // ---- Player info (if save exists) ----
    if (this._hasSave) {
      this.add.text(width / 2, 170, `Gold: ${this.playerGold}  |  Max Depth: ${this.maxDepth}`, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#f0c040',
      }).setOrigin(0.5).setDepth(5);
    }

    // ---- Zone auto-select (always start in first zone) ----
    this.selectedZone = ZONES[0];
    this.registry.set('selectedZone', this.selectedZone.id);

    // Show current zone info
    this.add.text(width / 2, 240, `Zone: ${this.selectedZone.name}`, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: this.selectedZone.color || '#aaaacc',
    }).setOrigin(0.5).setDepth(5);

    if (this.maxDepth > 0) {
      this.add.text(width / 2, 260, `Best Depth: ${this.maxDepth}`, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#888899',
      }).setOrigin(0.5).setDepth(5);
    }

    // ---- Buttons ----
    const btnY = 320;

    // Start Run button
    this._createButton(width / 2, btnY, 200, 48, 'Start Run', 0xe94560, () => {
      this.cameras.main.fadeOut(300, 0x1a, 0x1a, 0x2e);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ClassSelectScene', {
          saveData: this._hasSave ? this.savedPlayer : null,
        });
      });
    });

    // Continue button (only if save exists)
    if (this._hasSave) {
      this._createButton(width / 2, btnY + 65, 200, 48, 'Continue', 0x0f3460, () => {
        this.cameras.main.fadeOut(300, 0x1a, 0x1a, 0x2e);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('GameScene', {
            zone: this.selectedZone,
            saveData: this.savedPlayer,
          });
        });
      });
    }

    // Upgrades button
    const upgradesBtnY = this._hasSave ? btnY + 130 : btnY + 65;
    this._createButton(width / 2, upgradesBtnY, 200, 48, 'Upgrades', 0x16213e, () => {
      this._showUpgradePanel();
    });

    // Leaderboard button
    const lbBtnY = upgradesBtnY + 65;
    this._createButton(width / 2, lbBtnY, 200, 48, 'Leaderboard', 0x16213e, () => {
      this._showLeaderboard();
    });

    // ---- Auth / Account ----
    this._drawAuthSection(width);

    // ---- Upgrade panel container (hidden initially) ----
    this.upgradePanel = null;
  }

  _createParticles(width, height) {
    const particleCount = 30;
    this.particles = [];
    for (let i = 0; i < particleCount; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const g = this.add.graphics();
      const size = Phaser.Math.FloatBetween(1, 3);
      g.fillStyle(0x4444aa, Phaser.Math.FloatBetween(0.1, 0.4));
      g.fillCircle(0, 0, size);
      g.setPosition(x, y);
      g.setDepth(1);
      this.particles.push({
        graphic: g,
        speed: Phaser.Math.FloatBetween(0.15, 0.5),
        x, y, maxY: height, maxX: width,
      });
    }
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

  _createZoneCard(x, y, w, h, zone, isSelected) {
    const container = { graphics: null, texts: [], hitArea: null, zoneData: zone, x, y, w, h };

    const g = this.add.graphics().setDepth(5);
    container.graphics = g;

    this._drawZoneCard(g, x, y, w, h, zone, isSelected);

    // Zone name
    const nameText = this.add.text(x + w / 2, y + 20, zone.name, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: w - 10 },
    }).setOrigin(0.5).setDepth(6);
    container.texts.push(nameText);

    // Unlock depth
    const depthText = this.add.text(x + w / 2, y + h - 16, `Depth ${zone.unlockDepth}+`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#aaaacc',
    }).setOrigin(0.5).setDepth(6);
    container.texts.push(depthText);

    // Interactive hit area
    const hitArea = this.add.rectangle(x + w / 2, y + h / 2, w, h)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001)
      .setDepth(7);
    container.hitArea = hitArea;

    hitArea.on('pointerover', () => {
      g.clear();
      g.lineStyle(2, 0xe94560, 1);
      g.fillStyle(Phaser.Display.Color.HexStringToColor(zone.color).color, 0.5);
      g.fillRoundedRect(x, y, w, h, 8);
      g.strokeRoundedRect(x, y, w, h, 8);
    });

    hitArea.on('pointerout', () => {
      const sel = this.selectedZone && this.selectedZone.id === zone.id;
      this._drawZoneCard(g, x, y, w, h, zone, sel);
    });

    return container;
  }

  _drawZoneCard(g, x, y, w, h, zone, isSelected) {
    g.clear();
    const borderColor = isSelected ? 0xe94560 : 0x333355;
    g.lineStyle(2, borderColor, 1);
    g.fillStyle(Phaser.Display.Color.HexStringToColor(zone.color).color, 0.3);
    g.fillRoundedRect(x, y, w, h, 8);
    g.strokeRoundedRect(x, y, w, h, 8);
  }

  _updateZoneCardHighlight(card, isSelected) {
    this._drawZoneCard(card.graphics, card.x, card.y, card.w, card.h, card.zoneData, isSelected);
  }

  _createButton(x, y, w, h, label, bgColor, onClick) {
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(bgColor, 1);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    g.lineStyle(2, 0xe94560, 0.6);
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);

    const text = this.add.text(x, y, label, {
      fontFamily: 'monospace',
      fontSize: '18px',
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

    // Build a Player object if we have save data so we can use ProgressionSystem
    let player = null;
    if (this.savedPlayer) {
      player = Player.fromSaveData(this.savedPlayer);
    } else {
      player = new Player();
    }

    const { width, height } = this.scale;
    const panelW = 600;
    const panelH = 460;
    const panelX = (width - panelW) / 2;
    const panelY = (height - panelH) / 2;

    const container = this.add.container(0, 0).setDepth(20);
    this.upgradePanel = container;
    this._upgradePanelPlayer = player;

    // Backdrop overlay
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
    const titleText = this.add.text(width / 2, panelY + 30, 'UPGRADES', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#e94560',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);
    container.add(titleText);

    // Gold display
    const goldText = this.add.text(width / 2, panelY + 60, `Gold: ${player.gold}`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#f0c040',
    }).setOrigin(0.5).setDepth(2);
    container.add(goldText);

    // Get upgrades via ProgressionSystem
    const upgrades = getAllUpgrades(player);
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
      const labelText = this.add.text(panelX + 35, ry + 10, upg.label, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
      }).setDepth(2);
      container.add(labelText);

      // Level
      const levelText = this.add.text(panelX + 35, ry + 32, `Level: ${upg.currentLevel} / ${upg.maxLevel}`, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#aaaacc',
      }).setDepth(2);
      container.add(levelText);

      // Bonus value display
      const isPercent = upg.type === UPGRADE_TYPES.DROP_RATE || upg.type === UPGRADE_TYPES.GOLD_GAIN;
      const bonusStr = isPercent
        ? `+${(upg.currentValue * 100).toFixed(0)}%`
        : `+${upg.currentValue}`;
      const bonusText = this.add.text(panelX + 280, ry + 20, bonusStr, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#4ade80',
      }).setOrigin(0.5).setDepth(2);
      container.add(bonusText);

      // Buy button
      const maxed = upg.currentLevel >= upg.maxLevel;
      const canAfford = upg.canAfford;
      const btnW = 120;
      const btnH = 36;
      const btnX = panelX + panelW - 30 - btnW;
      const btnY2 = ry + (rowH - 8) / 2 - btnH / 2;

      const btnG = this.add.graphics().setDepth(2);
      const btnColor = maxed ? 0x333355 : (canAfford ? 0x2a7a2a : 0x553333);
      btnG.fillStyle(btnColor, 1);
      btnG.fillRoundedRect(btnX, btnY2, btnW, btnH, 6);
      container.add(btnG);

      const btnLabel = maxed ? 'MAXED' : `${upg.cost} g`;
      const btnText = this.add.text(btnX + btnW / 2, btnY2 + btnH / 2, btnLabel, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: maxed ? '#666666' : (canAfford ? '#ffffff' : '#aa6666'),
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(3);
      container.add(btnText);

      if (!maxed) {
        const btnHit = this.add.rectangle(btnX + btnW / 2, btnY2 + btnH / 2, btnW, btnH)
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: canAfford })
          .setAlpha(0.001)
          .setDepth(4);
        container.add(btnHit);

        btnHit.on('pointerdown', () => {
          const applied = applyUpgrade(player, upg.type);
          if (applied) {
            // Save game with updated player
            try {
              this.savedPlayer = player.toSaveData();
              this.playerGold = player.gold;
              saveGame(player);
            } catch (_) { /* ignore */ }

            // Refresh panel
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
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3);
    container.add(closeText);

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
      this._upgradePanelPlayer = null;
    }
  }

  _drawAuthSection(width) {
    // Clean up previous auth elements
    if (this.authElements) this.authElements.forEach(e => e.destroy());
    this.authElements = [];

    if (isLoggedIn()) {
      // Show username + logout button
      const userText = this.add.text(width - 20, 16, `⚔ ${getUsername()}`, {
        fontFamily: 'monospace', fontSize: '12px', color: '#4ade80', fontStyle: 'bold',
      }).setOrigin(1, 0).setDepth(10);
      this.authElements.push(userText);

      const logoutText = this.add.text(width - 20, 34, '[Logout]', {
        fontFamily: 'monospace', fontSize: '10px', color: '#888899',
      }).setOrigin(1, 0).setDepth(10).setInteractive({ useHandCursor: true });
      logoutText.on('pointerdown', () => {
        logout();
        this._drawAuthSection(width);
      });
      logoutText.on('pointerover', () => logoutText.setColor('#ffffff'));
      logoutText.on('pointerout', () => logoutText.setColor('#888899'));
      this.authElements.push(logoutText);
    } else {
      // Show login button
      const loginBtn = this.add.text(width - 20, 16, '[Login / Register]', {
        fontFamily: 'monospace', fontSize: '11px', color: '#60a5fa',
      }).setOrigin(1, 0).setDepth(10).setInteractive({ useHandCursor: true });
      loginBtn.on('pointerdown', () => this._showLoginModal());
      loginBtn.on('pointerover', () => loginBtn.setColor('#ffffff'));
      loginBtn.on('pointerout', () => loginBtn.setColor('#60a5fa'));
      this.authElements.push(loginBtn);
    }
  }

  _showLoginModal() {
    if (this.loginModal) return;

    const w = this.scale.width;
    const h = this.scale.height;
    const container = this.add.container(0, 0).setDepth(50);
    this.loginModal = container;

    // Backdrop
    const backdrop = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7).setInteractive();
    container.add(backdrop);

    // Modal box
    const mw = 320;
    const mh = 280;
    const mx = w / 2 - mw / 2;
    const my = h / 2 - mh / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x16213e, 1);
    bg.fillRoundedRect(mx, my, mw, mh, 10);
    bg.lineStyle(2, 0x333355, 1);
    bg.strokeRoundedRect(mx, my, mw, mh, 10);
    container.add(bg);

    container.add(this.add.text(w / 2, my + 20, 'LOGIN / REGISTER', {
      fontFamily: 'monospace', fontSize: '16px', color: '#e94560', fontStyle: 'bold',
    }).setOrigin(0.5));

    // Instructions
    container.add(this.add.text(w / 2, my + 45, 'Enter username and password', {
      fontFamily: 'monospace', fontSize: '10px', color: '#888899',
    }).setOrigin(0.5));

    // We can't use HTML inputs in Phaser canvas, so use prompt() dialogs
    // This is the simplest approach for a game

    // Login button
    this._createModalButton(container, w / 2, my + 100, 200, 40, 'Login', 0x0f3460, () => {
      const username = prompt('Username:');
      if (!username) return;
      const password = prompt('Password:');
      if (!password) return;
      login(username, password).then(() => {
        this._closeLoginModal();
        this._drawAuthSection(this.scale.width);
      }).catch(err => {
        alert(err.message);
      });
    });

    // Register button
    this._createModalButton(container, w / 2, my + 155, 200, 40, 'Register New Account', 0x2a5a28, () => {
      const username = prompt('Choose username (2-20 chars):');
      if (!username) return;
      const password = prompt('Choose password (4+ chars):');
      if (!password) return;
      register(username, password).then(() => {
        // Auto-login after register
        return login(username, password);
      }).then(() => {
        this._closeLoginModal();
        this._drawAuthSection(this.scale.width);
      }).catch(err => {
        alert(err.message);
      });
    });

    // Close button
    this._createModalButton(container, w / 2, my + 220, 120, 30, 'Cancel', 0x333355, () => {
      this._closeLoginModal();
    });
  }

  _closeLoginModal() {
    if (this.loginModal) {
      this.loginModal.destroy();
      this.loginModal = null;
    }
  }

  _createModalButton(container, x, y, w, h, text, color, onClick) {
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    bg.lineStyle(1, 0x555577, 0.6);
    bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    container.add(bg);

    const label = this.add.text(x, y, text, {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(label);

    const hitArea = this.add.rectangle(x, y, w, h).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    container.add(hitArea);
    hitArea.on('pointerdown', onClick);
    hitArea.on('pointerover', () => label.setColor('#f0c040'));
    hitArea.on('pointerout', () => label.setColor('#ffffff'));
  }

  async _showLeaderboard() {
    if (this.lbPanel) return;

    const w = this.scale.width;
    const h = this.scale.height;
    const container = this.add.container(0, 0).setDepth(50);
    this.lbPanel = container;

    // Backdrop
    const backdrop = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7).setInteractive();
    container.add(backdrop);
    backdrop.on('pointerdown', () => this._closeLeaderboard());

    // Panel
    const pw = 500;
    const ph = 480;
    const px = w / 2 - pw / 2;
    const py = h / 2 - ph / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1e, 0.98);
    bg.fillRoundedRect(px, py, pw, ph, 10);
    bg.lineStyle(2, 0xf97316, 0.8);
    bg.strokeRoundedRect(px, py, pw, ph, 10);
    container.add(bg);

    container.add(this.add.text(w / 2, py + 20, 'LEADERBOARD', {
      fontFamily: 'monospace', fontSize: '18px', color: '#f97316', fontStyle: 'bold',
    }).setOrigin(0.5));

    // Column headers
    const headerY = py + 50;
    const cols = [px + 15, px + 38, px + 120, px + 175, px + 215, px + 275, px + 355, px + 420];
    const headers = ['#', 'Player', 'Class', 'Lv', 'Depth', 'Kills', 'Best Hit', 'Killed By'];
    headers.forEach((hdr, i) => {
      container.add(this.add.text(cols[i], headerY, hdr, {
        fontFamily: 'monospace', fontSize: '10px', color: '#888899', fontStyle: 'bold',
      }));
    });

    // Separator
    const sep = this.add.graphics();
    sep.lineStyle(1, 0x333355, 0.6);
    sep.lineBetween(px + 10, headerY + 16, px + pw - 10, headerY + 16);
    container.add(sep);

    // Loading text
    const loadingText = this.add.text(w / 2, py + ph / 2, 'Loading...', {
      fontFamily: 'monospace', fontSize: '14px', color: '#aaaacc',
    }).setOrigin(0.5);
    container.add(loadingText);

    // Fetch leaderboard
    const entries = await getLeaderboard();
    loadingText.destroy();

    if (entries.length === 0) {
      container.add(this.add.text(w / 2, py + ph / 2, 'No scores yet. Be the first!', {
        fontFamily: 'monospace', fontSize: '12px', color: '#888899',
      }).setOrigin(0.5));
    } else {
      entries.slice(0, 20).forEach((entry, i) => {
        const ey = headerY + 22 + i * 18;
        const isMe = isLoggedIn() && entry.username === getUsername();
        const rowColor = isMe ? '#f0c040' : '#ccccdd';
        const rankColor = i < 3 ? '#f97316' : rowColor;

        const fs = '9px';
        container.add(this.add.text(cols[0], ey, `${entry.rank}`, {
          fontFamily: 'monospace', fontSize: fs, color: rankColor, fontStyle: i < 3 ? 'bold' : 'normal',
        }));
        container.add(this.add.text(cols[1], ey, entry.username, {
          fontFamily: 'monospace', fontSize: fs, color: rowColor,
        }));
        const className = (entry.class || 'slayer').charAt(0).toUpperCase() + (entry.class || 'slayer').slice(1);
        container.add(this.add.text(cols[2], ey, className, {
          fontFamily: 'monospace', fontSize: fs, color: '#c084fc',
        }));
        container.add(this.add.text(cols[3], ey, `${entry.level || 1}`, {
          fontFamily: 'monospace', fontSize: fs, color: '#f0c040',
        }));
        container.add(this.add.text(cols[4], ey, `${entry.depth}`, {
          fontFamily: 'monospace', fontSize: fs, color: rowColor,
        }));
        container.add(this.add.text(cols[5], ey, `${entry.kills}`, {
          fontFamily: 'monospace', fontSize: fs, color: rowColor,
        }));
        container.add(this.add.text(cols[6], ey, `${entry.highest_damage || 0}`, {
          fontFamily: 'monospace', fontSize: fs, color: '#f97316',
        }));
        container.add(this.add.text(cols[7], ey, entry.killed_by || '--', {
          fontFamily: 'monospace', fontSize: fs, color: entry.killed_by ? '#e94560' : '#555566',
        }));
      });
    }

    // Close button
    this._createModalButton(container, w / 2, py + ph - 30, 120, 30, 'Close', 0x333355, () => {
      this._closeLeaderboard();
    });
  }

  _closeLeaderboard() {
    if (this.lbPanel) {
      this.lbPanel.destroy();
      this.lbPanel = null;
    }
  }
}
