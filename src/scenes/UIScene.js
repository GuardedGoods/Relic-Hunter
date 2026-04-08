import Phaser from 'phaser';
import { RARITY_COLORS, SLOT, INVENTORY_COLS, INVENTORY_ROWS, INVENTORY_SIZE, ITEM_SETS, RARITY, RARITY_ORDER } from '../data/constants.js';
import { compareItems, formatAffix, getItemScore } from '../systems/InventorySystem.js';

const UI_X = 680;
const UI_W = 596;
const PANEL_COLOR = 0x16213e;
const PANEL_BORDER = 0x333355;
const ACCENT = 0xe94560;

const SLOT_ICONS = {
  [SLOT.WEAPON]: '⚔',
  [SLOT.HELMET]: '👑',
  [SLOT.CHEST]: '🛡',
  [SLOT.GLOVES]: '🧤',
  [SLOT.BOOTS]: '👢',
  ring: '💍',
};

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  init(data) {
    this.player = data.player;
  }

  create() {
    this.tooltipContainer = null;
    this.lootPopup = null;
    this.equipSlotElements = [];
    this.invCellElements = [];
    this.filterElements = [];
    this.setBonusTexts = [];
    this._invTitleText = null;

    // ---- Stats panel (top) ----
    this._drawStatsPanel();

    // ---- Equipment panel (middle) ----
    this._drawEquipmentPanel();

    // ---- Inventory panel (bottom) ----
    this._drawInventoryPanel();

    // ---- Listen for events from GameScene ----
    const gameScene = this.scene.get('GameScene');
    if (gameScene) {
      gameScene.events.on('lootDrop', this._onLootDrop, this);
      gameScene.events.on('playerHealthChanged', this._onHealthChanged, this);
      gameScene.events.on('statsChanged', this._onStatsChanged, this);
      gameScene.events.on('pauseToggled', this._onPauseToggled, this);
    }

    // ---- Set bonus indicator ----
    this._updateSetBonuses();
  }

  // ==========================
  // STATS PANEL
  // ==========================

  _drawStatsPanel() {
    const panelX = UI_X;
    const panelY = 4;
    const panelW = UI_W;
    const panelH = 120;

    const bg = this.add.graphics().setDepth(1);
    bg.fillStyle(PANEL_COLOR, 0.95);
    bg.fillRoundedRect(panelX, panelY, panelW, panelH, 6);
    bg.lineStyle(1, PANEL_BORDER, 1);
    bg.strokeRoundedRect(panelX, panelY, panelW, panelH, 6);

    this.add.text(panelX + panelW / 2, panelY + 14, 'STATS', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#e94560',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);

    this.statTexts = {};
    const stats = this.player.getComputedStats();

    const leftCol = [
      { key: 'maxHealth', label: 'HP', icon: '+', format: v => `${Math.ceil(v)}` },
      { key: 'attack', label: 'ATK', icon: '/', format: v => `${Math.ceil(v)}` },
      { key: 'defense', label: 'DEF', icon: '#', format: v => `${Math.ceil(v)}` },
      { key: 'attackSpeed', label: 'SPD', icon: '>', format: v => `${v.toFixed(2)}` },
    ];

    const rightCol = [
      { key: 'critChance', label: 'CRIT%', icon: '!', format: v => `${(v * 100).toFixed(1)}%` },
      { key: 'critDamage', label: 'CDMG', icon: 'x', format: v => `${v.toFixed(2)}x` },
      { key: 'fireDamage', label: 'FIRE', icon: '~', format: v => `${Math.ceil(v)}`, color: '#f97316' },
      { key: 'iceDamage', label: 'ICE', icon: '*', format: v => `${Math.ceil(v)}`, color: '#60a5fa' },
    ];

    const bottomStats = [
      { key: 'poisonDamage', label: 'PSN', icon: '%', format: v => `${Math.ceil(v)}`, color: '#4ade80' },
    ];

    const sx = panelX + 14;
    const sy = panelY + 30;
    const lineH = 20;

    leftCol.forEach((s, i) => {
      const val = stats[s.key] || 0;
      const t = this.add.text(sx, sy + i * lineH, `${s.icon} ${s.label}: ${s.format(val)}`, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: s.color || '#ccccdd',
      }).setDepth(2);
      this.statTexts[s.key] = { text: t, format: s.format, label: s.label, icon: s.icon, color: s.color };
    });

    const rx = panelX + panelW / 2 + 10;
    rightCol.forEach((s, i) => {
      const val = stats[s.key] || 0;
      const t = this.add.text(rx, sy + i * lineH, `${s.icon} ${s.label}: ${s.format(val)}`, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: s.color || '#ccccdd',
      }).setDepth(2);
      this.statTexts[s.key] = { text: t, format: s.format, label: s.label, icon: s.icon, color: s.color };
    });

    bottomStats.forEach((s, i) => {
      const val = stats[s.key] || 0;
      const t = this.add.text(sx, sy + leftCol.length * lineH + i * lineH, `${s.icon} ${s.label}: ${s.format(val)}`, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: s.color || '#ccccdd',
      }).setDepth(2);
      this.statTexts[s.key] = { text: t, format: s.format, label: s.label, icon: s.icon, color: s.color };
    });

    // Health bar
    const hbX = panelX + panelW / 2 + 10;
    const hbY = sy + 4 * lineH + 2;
    const hbW = panelW / 2 - 24;
    const hbH = 12;
    this.healthBarPos = { x: hbX, y: hbY, w: hbW, h: hbH };
    this.statsHealthBarBg = this.add.graphics().setDepth(2);
    this.statsHealthBarFill = this.add.graphics().setDepth(3);
    this._updateHealthBar();
  }

  _updateStatsDisplay() {
    const stats = this.player.getComputedStats();
    this.player.stats = stats;

    for (const [key, entry] of Object.entries(this.statTexts)) {
      const val = stats[key] || 0;
      entry.text.setText(`${entry.icon} ${entry.label}: ${entry.format(val)}`);
    }

    this._updateHealthBar();
    this._updateSetBonuses();
  }

  _updateHealthBar() {
    const stats = this.player.getComputedStats();
    const maxHp = stats.maxHealth || 100;
    const curHp = Math.max(0, this.player.health || this.player.currentHealth || maxHp);
    const ratio = curHp / maxHp;

    const { x, y, w, h } = this.healthBarPos;

    this.statsHealthBarBg.clear();
    this.statsHealthBarBg.fillStyle(0x333333, 1);
    this.statsHealthBarBg.fillRoundedRect(x, y, w, h, 3);

    this.statsHealthBarFill.clear();
    const hpColor = ratio > 0.5 ? 0x4ade80 : (ratio > 0.25 ? 0xf0c040 : 0xe94560);
    if (ratio > 0) {
      this.statsHealthBarFill.fillStyle(hpColor, 1);
      this.statsHealthBarFill.fillRoundedRect(x + 1, y + 1, (w - 2) * ratio, h - 2, 2);
    }
  }

  // ==========================
  // EQUIPMENT PANEL
  // ==========================

  _drawEquipmentPanel() {
    const panelX = UI_X;
    const panelY = 130;
    const panelW = UI_W;
    const panelH = 170;

    const bg = this.add.graphics().setDepth(1);
    bg.fillStyle(PANEL_COLOR, 0.95);
    bg.fillRoundedRect(panelX, panelY, panelW, panelH, 6);
    bg.lineStyle(1, PANEL_BORDER, 1);
    bg.strokeRoundedRect(panelX, panelY, panelW, panelH, 6);

    this.add.text(panelX + panelW / 2, panelY + 14, 'EQUIPMENT', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#e94560',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);

    this._refreshEquipmentSlots();
  }

  _refreshEquipmentSlots() {
    for (const el of this.equipSlotElements) {
      if (el && el.destroy) el.destroy();
    }
    this.equipSlotElements = [];

    const panelX = UI_X;
    const panelY = 130;
    const panelW = UI_W;

    const slotKeys = [
      { key: SLOT.WEAPON, label: 'Weapon' },
      { key: SLOT.HELMET, label: 'Helmet' },
      { key: SLOT.CHEST, label: 'Chest' },
      { key: SLOT.GLOVES, label: 'Gloves' },
      { key: SLOT.BOOTS, label: 'Boots' },
      { key: 'ring', label: 'Ring' },
    ];

    const slotH = 20;
    const startY = panelY + 30;

    slotKeys.forEach((slot, i) => {
      const sy = startY + i * slotH;
      const item = this.player.equipment[slot.key];

      // Slot label
      const icon = SLOT_ICONS[slot.key] || '•';
      const labelText = this.add.text(panelX + 14, sy, `${icon} ${slot.label}:`, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#888899',
      }).setDepth(2);
      this.equipSlotElements.push(labelText);

      if (item) {
        const rarityColor = RARITY_COLORS[item.rarity] || '#ffffff';

        // Rarity dot
        const dotG = this.add.graphics().setDepth(2);
        dotG.fillStyle(Phaser.Display.Color.HexStringToColor(rarityColor).color, 1);
        dotG.fillCircle(panelX + 82, sy + 6, 3);
        this.equipSlotElements.push(dotG);

        const itemText = this.add.text(panelX + 90, sy, item.name, {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: rarityColor,
        }).setDepth(2);
        this.equipSlotElements.push(itemText);

        // Clickable
        const hitArea = this.add.rectangle(panelX + panelW / 2, sy + 6, panelW - 20, slotH - 2)
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .setAlpha(0.001)
          .setDepth(3);
        this.equipSlotElements.push(hitArea);

        hitArea.on('pointerover', () => itemText.setColor('#ffffff'));
        hitArea.on('pointerout', () => itemText.setColor(rarityColor));
        hitArea.on('pointerdown', () => this._onEquipSlotClick(slot.key, item));
      } else {
        const emptyText = this.add.text(panelX + 90, sy, '-- Empty --', {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#444455',
        }).setDepth(2);
        this.equipSlotElements.push(emptyText);
      }
    });
  }

  _onEquipSlotClick(slotKey, item) {
    if (this.player.isInventoryFull()) {
      this._showFloatingMessage('Inventory Full!', '#e94560');
      return;
    }
    const unequipped = this.player.unequip(slotKey);
    if (unequipped) {
      this.player.addToInventory(unequipped);
      this._refreshAll();
    }
  }

  // ==========================
  // INVENTORY PANEL
  // ==========================

  _drawInventoryPanel() {
    this.invPanelX = UI_X;
    this.invPanelY = 306;
    this.invPanelW = UI_W;
    const panelH = 330;

    const bg = this.add.graphics().setDepth(1);
    bg.fillStyle(PANEL_COLOR, 0.95);
    bg.fillRoundedRect(this.invPanelX, this.invPanelY, this.invPanelW, panelH, 6);
    bg.lineStyle(1, PANEL_BORDER, 1);
    bg.strokeRoundedRect(this.invPanelX, this.invPanelY, this.invPanelW, panelH, 6);

    this._invTitleText = this.add.text(this.invPanelX + this.invPanelW / 2, this.invPanelY + 14,
      `INVENTORY (${this.player.inventory.length}/${INVENTORY_SIZE})`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#e94560',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);

    const panelX = this.invPanelX;
    const panelY = this.invPanelY;
    const panelW = this.invPanelW;

    // Trash by rarity buttons - clear label
    this.add.text(panelX + 14, panelY + 4, 'Trash:', {
      fontFamily: 'monospace', fontSize: '9px', color: '#666677',
    }).setDepth(2);

    const trashRarities = [
      { rarity: RARITY.COMMON, label: 'Com', color: RARITY_COLORS[RARITY.COMMON] },
      { rarity: RARITY.UNCOMMON, label: 'Unc', color: RARITY_COLORS[RARITY.UNCOMMON] },
      { rarity: RARITY.RARE, label: 'Rar', color: RARITY_COLORS[RARITY.RARE] },
      { rarity: RARITY.EPIC, label: 'Epc', color: RARITY_COLORS[RARITY.EPIC] },
      { rarity: RARITY.LEGENDARY, label: 'Leg', color: RARITY_COLORS[RARITY.LEGENDARY] },
    ];

    const trashBtnW = 32;
    const trashBtnH = 14;
    const trashStartX = panelX + 50;
    const trashY = panelY + 3;

    trashRarities.forEach((tr, i) => {
      const tx = trashStartX + i * (trashBtnW + 2);
      const tbg = this.add.graphics().setDepth(2);
      tbg.fillStyle(0x1a1020, 1);
      tbg.fillRoundedRect(tx, trashY, trashBtnW, trashBtnH, 2);
      const trashColorInt = Phaser.Display.Color.HexStringToColor(tr.color).color;
      tbg.lineStyle(1, trashColorInt, 0.5);
      tbg.strokeRoundedRect(tx, trashY, trashBtnW, trashBtnH, 2);

      const tLabel = this.add.text(tx + trashBtnW / 2, trashY + trashBtnH / 2, tr.label, {
        fontFamily: 'monospace', fontSize: '7px', color: tr.color,
      }).setOrigin(0.5).setDepth(3);

      const tHit = this.add.rectangle(tx + trashBtnW / 2, trashY + trashBtnH / 2, trashBtnW, trashBtnH)
        .setInteractive({ useHandCursor: true }).setAlpha(0.001).setDepth(4);

      tHit.on('pointerover', () => tLabel.setColor('#ffffff'));
      tHit.on('pointerout', () => tLabel.setColor(tr.color));
      tHit.on('pointerdown', () => {
        const items = this.player.inventory.filter(it => it.rarity === tr.rarity);
        if (items.length > 0) {
          items.forEach(it => this.player.removeFromInventory(it.id));
          this._showFloatingMessage(`Trashed ${items.length} ${tr.rarity}`, tr.color);
          this._refreshAll();
        }
      });
    });

    // Auto-skip filter row
    this.add.text(panelX + 14, trashY + trashBtnH + 3, 'Auto-skip:', {
      fontFamily: 'monospace', fontSize: '8px', color: '#555566',
    }).setDepth(2);

    if (!this.player.lootFilter) this.player.lootFilter = {};
    this.filterElements = [];

    trashRarities.forEach((tr, i) => {
      const fx = trashStartX + i * (trashBtnW + 2);
      const fy = trashY + trashBtnH + 2;
      const isSkipped = !!this.player.lootFilter[tr.rarity];

      const fbg = this.add.graphics().setDepth(2);
      if (isSkipped) {
        fbg.fillStyle(0x331111, 1);
        fbg.fillRoundedRect(fx, fy, trashBtnW, trashBtnH, 2);
        fbg.lineStyle(1, 0xe94560, 0.6);
        fbg.strokeRoundedRect(fx, fy, trashBtnW, trashBtnH, 2);
      } else {
        fbg.fillStyle(0x0a0a18, 1);
        fbg.fillRoundedRect(fx, fy, trashBtnW, trashBtnH, 2);
        fbg.lineStyle(1, 0x333344, 0.3);
        fbg.strokeRoundedRect(fx, fy, trashBtnW, trashBtnH, 2);
      }
      this.filterElements.push(fbg);

      const fLabel = this.add.text(fx + trashBtnW / 2, fy + trashBtnH / 2,
        isSkipped ? '\u2715' : '\u2014', {
        fontFamily: 'monospace', fontSize: '8px',
        color: isSkipped ? '#e94560' : '#333344',
        fontStyle: isSkipped ? 'bold' : 'normal',
      }).setOrigin(0.5).setDepth(3);
      this.filterElements.push(fLabel);

      const fHit = this.add.rectangle(fx + trashBtnW / 2, fy + trashBtnH / 2, trashBtnW, trashBtnH)
        .setInteractive({ useHandCursor: true }).setAlpha(0.001).setDepth(4);
      this.filterElements.push(fHit);

      fHit.on('pointerdown', () => {
        this.player.lootFilter[tr.rarity] = !this.player.lootFilter[tr.rarity];
        // Rebuild inventory panel to reflect new filter state
        this._drawInventoryPanel();
      });
    });


    this._refreshInventoryGrid();
  }

  _refreshInventoryGrid() {
    for (const el of this.invCellElements) {
      if (el && el.destroy) el.destroy();
    }
    this.invCellElements = [];

    const panelX = this.invPanelX || UI_X;
    const panelY = this.invPanelY || 306;
    const panelW = this.invPanelW || UI_W;
    const panelH = 330;

    const padding = 14;
    const headerHeight = 55;
    const gap = 4;
    const cellW = Math.floor((panelW - padding * 2 - (INVENTORY_COLS - 1) * gap) / INVENTORY_COLS);
    const cellH = Math.floor((panelH - headerHeight - padding * 2 - (INVENTORY_ROWS - 1) * gap) / INVENTORY_ROWS);
    const startX = panelX + padding;
    const startY = panelY + headerHeight;

    for (let row = 0; row < INVENTORY_ROWS; row++) {
      for (let col = 0; col < INVENTORY_COLS; col++) {
        const idx = row * INVENTORY_COLS + col;
        const cx = startX + col * (cellW + gap);
        const cy = startY + row * (cellH + gap);
        const item = this.player.inventory[idx] || null;

        const cellBg = this.add.graphics().setDepth(2);
        cellBg.fillStyle(0x0f3460, 0.5);
        cellBg.fillRoundedRect(cx, cy, cellW, cellH, 4);
        cellBg.lineStyle(1, item ? 0x555577 : 0x333355, 1);
        cellBg.strokeRoundedRect(cx, cy, cellW, cellH, 4);
        this.invCellElements.push(cellBg);

        if (item) {
          const rarityColor = RARITY_COLORS[item.rarity] || '#ffffff';
          const displayName = item.name.length > 9 ? item.name.substring(0, 8) + '.' : item.name;

          const itemText = this.add.text(cx + cellW / 2, cy + 14, displayName, {
            fontFamily: 'monospace',
            fontSize: '8px',
            color: rarityColor,
            align: 'center',
          }).setOrigin(0.5).setDepth(3);
          this.invCellElements.push(itemText);

          const slotText = this.add.text(cx + cellW / 2, cy + 30, item.slot, {
            fontFamily: 'monospace',
            fontSize: '7px',
            color: '#666677',
          }).setOrigin(0.5).setDepth(3);
          this.invCellElements.push(slotText);

          const score = getItemScore(item);
          const scoreText = this.add.text(cx + cellW - 3, cy + 3, score.toFixed(1), {
            fontFamily: 'monospace',
            fontSize: '7px',
            color: '#888899',
          }).setOrigin(1, 0).setDepth(3);
          this.invCellElements.push(scoreText);

          // Compare to equipped
          const equippedSlotKey = item.slot === SLOT.RING ? 'ring' : item.slot;
          const equippedItem = this.player.equipment[equippedSlotKey] || null;
          const comparison = compareItems(equippedItem, item, this.player.getComputedStats());

          let arrowText = '▲';
          let arrowColor = '#4ade80'; // green = upgrade
          if (equippedItem) {
            if (comparison.overallBetter) {
              arrowText = '▲';
              arrowColor = '#4ade80';
            } else if (comparison.changes.every(c => c.diff === 0)) {
              arrowText = '●';
              arrowColor = '#f0c040';
            } else {
              arrowText = '▼';
              arrowColor = '#e94560';
            }
          }

          const arrow = this.add.text(cx + cellW - 4, cy + 2, arrowText, {
            fontFamily: 'monospace', fontSize: '10px', color: arrowColor, fontStyle: 'bold',
          }).setOrigin(1, 0).setDepth(3);
          this.invCellElements.push(arrow);

          const hitArea = this.add.rectangle(cx + cellW / 2, cy + cellH / 2, cellW, cellH)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setAlpha(0.001)
            .setDepth(4);
          this.invCellElements.push(hitArea);

          const rColorInt = Phaser.Display.Color.HexStringToColor(rarityColor).color;

          hitArea.on('pointerover', () => {
            cellBg.clear();
            cellBg.fillStyle(0x1a4480, 0.8);
            cellBg.fillRoundedRect(cx, cy, cellW, cellH, 4);
            cellBg.lineStyle(1, rColorInt, 1);
            cellBg.strokeRoundedRect(cx, cy, cellW, cellH, 4);
          });
          hitArea.on('pointerout', () => {
            cellBg.clear();
            cellBg.fillStyle(0x0f3460, 0.5);
            cellBg.fillRoundedRect(cx, cy, cellW, cellH, 4);
            cellBg.lineStyle(1, 0x555577, 1);
            cellBg.strokeRoundedRect(cx, cy, cellW, cellH, 4);
          });
          hitArea.on('pointerdown', () => {
            this._showItemTooltip(item);
          });
        }
      }
    }

    // Update title
    if (this._invTitleText) {
      this._invTitleText.setText(`INVENTORY (${this.player.inventory.length}/${INVENTORY_SIZE})`);
    }
  }

  // ==========================
  // ITEM TOOLTIP
  // ==========================

  _showItemTooltip(item) {
    this._hideTooltip();

    const container = this.add.container(0, 0).setDepth(30);
    this.tooltipContainer = container;

    // Backdrop
    const backdrop = this.add.rectangle(480, 320, 960, 640, 0x000000, 0.4)
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(0);
    container.add(backdrop);
    backdrop.on('pointerdown', () => this._hideTooltip());

    // Figure out which equipped item to compare against
    let equippedSlotKey = item.slot;
    if (item.slot === SLOT.RING) {
      equippedSlotKey = 'ring';
    }
    const equippedItem = this.player.equipment[equippedSlotKey] || null;
    const comparison = compareItems(equippedItem, item, this.player.getComputedStats());
    const hasComparison = equippedItem !== null;

    const affixCount = item.affixes ? item.affixes.length : 0;
    const compChanges = hasComparison ? comparison.changes.filter(c => c.diff !== 0) : [];
    const hasSet = item.setId && ITEM_SETS[item.setId];

    // Calculate height
    let contentH = 100 + affixCount * 20;
    if (hasSet) contentH += 22;
    if (hasComparison) contentH += 30 + compChanges.length * 18;
    contentH += 60; // buttons

    const ttW = 300;
    const ttH = Math.min(contentH, 520);
    const ttX = 330;
    const ttY = Math.max(20, 320 - ttH / 2);

    // Background
    const bg = this.add.graphics().setDepth(1);
    const rarityColorInt = Phaser.Display.Color.HexStringToColor(RARITY_COLORS[item.rarity] || '#ffffff').color;
    bg.fillStyle(0x0f1a30, 0.98);
    bg.fillRoundedRect(ttX, ttY, ttW, ttH, 8);
    bg.lineStyle(2, rarityColorInt, 0.8);
    bg.strokeRoundedRect(ttX, ttY, ttW, ttH, 8);
    container.add(bg);

    let cy = ttY + 16;

    // Name
    const nameText = this.add.text(ttX + ttW / 2, cy, item.name, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: RARITY_COLORS[item.rarity] || '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);
    container.add(nameText);
    cy += 22;

    // Rarity + slot
    container.add(this.add.text(ttX + ttW / 2, cy, `${item.rarity.toUpperCase()} ${item.slot.toUpperCase()}`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#888899',
    }).setOrigin(0.5).setDepth(2));
    cy += 18;

    // Score
    const scoreVal = getItemScore(item);
    container.add(this.add.text(ttX + ttW / 2, cy, `Score: ${scoreVal.toFixed(2)}`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#aaaacc',
    }).setOrigin(0.5).setDepth(2));
    cy += 16;

    // Separator
    const sep = this.add.graphics().setDepth(2);
    sep.lineStyle(1, 0x333355, 1);
    sep.lineBetween(ttX + 15, cy, ttX + ttW - 15, cy);
    container.add(sep);
    cy += 10;

    // Affixes
    if (item.affixes) {
      for (const affix of item.affixes) {
        container.add(this.add.text(ttX + 18, cy, formatAffix(affix), {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#ccddee',
        }).setDepth(2));
        cy += 20;
      }
    }

    // Set info
    if (hasSet) {
      cy += 4;
      const setName = ITEM_SETS[item.setId].name;
      container.add(this.add.text(ttX + 18, cy, `Set: ${setName}`, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#4ade80',
        fontStyle: 'bold',
      }).setDepth(2));
      cy += 18;
    }

    // Comparison
    if (hasComparison && compChanges.length > 0) {
      cy += 4;
      const sep2 = this.add.graphics().setDepth(2);
      sep2.lineStyle(1, 0x333355, 1);
      sep2.lineBetween(ttX + 15, cy, ttX + ttW - 15, cy);
      container.add(sep2);
      cy += 8;

      container.add(this.add.text(ttX + ttW / 2, cy, `vs ${equippedItem.name}`, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#888899',
      }).setOrigin(0.5).setDepth(2));
      cy += 16;

      for (const change of compChanges) {
        const arrow = change.diff > 0 ? '+' : '';
        const color = change.diff > 0 ? '#4ade80' : '#e94560';
        const diffVal = Number.isFinite(change.diff) ? change.diff.toFixed(1) : '0';
        container.add(this.add.text(ttX + 18, cy, `${change.stat}: ${arrow}${diffVal}`, {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: color,
        }).setDepth(2));
        cy += 18;
      }
    }

    // Buttons
    cy += 10;
    const btnW = 100;
    const btnH = 30;

    // Equip button
    const eqBtnX = ttX + ttW / 2 - btnW - 10;
    this._createTooltipButton(container, eqBtnX, cy, btnW, btnH, 'Equip', 0x2a7a2a, 0x33aa33, () => {
      this._equipItem(item);
    });

    // Discard button
    const dBtnX = ttX + ttW / 2 + 10;
    this._createTooltipButton(container, dBtnX, cy, btnW, btnH, 'Discard', 0x7a2a2a, 0xaa3333, () => {
      this._discardItem(item);
    });
  }

  _createTooltipButton(container, x, y, w, h, label, bgColor, hoverColor, onClick) {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(bgColor, 1);
    g.fillRoundedRect(x, y, w, h, 5);
    container.add(g);

    const text = this.add.text(x + w / 2, y + h / 2, label, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3);
    container.add(text);

    const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001)
      .setDepth(4);
    container.add(hit);

    hit.on('pointerover', () => {
      g.clear();
      g.fillStyle(hoverColor, 1);
      g.fillRoundedRect(x, y, w, h, 5);
    });
    hit.on('pointerout', () => {
      g.clear();
      g.fillStyle(bgColor, 1);
      g.fillRoundedRect(x, y, w, h, 5);
    });
    hit.on('pointerdown', onClick);
  }

  _hideTooltip() {
    if (this.tooltipContainer) {
      this.tooltipContainer.destroy();
      this.tooltipContainer = null;
    }
  }

  // ==========================
  // ITEM ACTIONS
  // ==========================

  _equipItem(item) {
    this.player.removeFromInventory(item.id);
    const oldItem = this.player.equip(item);
    if (oldItem) {
      this.player.addToInventory(oldItem);
    }
    const stats = this.player.getComputedStats();
    this.player.stats = stats;

    this._hideTooltip();
    this._refreshAll();
  }

  _discardItem(item) {
    this.player.removeFromInventory(item.id);
    this._hideTooltip();
    this._refreshAll();
    this._showFloatingMessage(`Discarded ${item.name}`, '#888899');
  }

  // ==========================
  // LOOT DROP HANDLING
  // ==========================

  _onLootDrop(data) {
    const { item } = data;

    // Auto-skip filtered rarities
    if (this.player.lootFilter && this.player.lootFilter[item.rarity]) {
      return; // silently skip this item
    }

    if (!this.player.isInventoryFull()) {
      this.player.addToInventory(item);
      this._refreshAll();

      // Flash effect on the new item cell
      const idx = this.player.inventory.length - 1;
      const col = idx % INVENTORY_COLS;
      const row = Math.floor(idx / INVENTORY_COLS);
      const invPanelH = 330;
      const invPadding = 14;
      const invHeaderH = 55;
      const invGap = 4;
      const cellW = Math.floor((UI_W - invPadding * 2 - (INVENTORY_COLS - 1) * invGap) / INVENTORY_COLS);
      const cellH = Math.floor((invPanelH - invHeaderH - invPadding * 2 - (INVENTORY_ROWS - 1) * invGap) / INVENTORY_ROWS);
      const fx = UI_X + invPadding + col * (cellW + invGap) + cellW / 2;
      const fy = (this.invPanelY || 306) + invHeaderH + row * (cellH + invGap) + cellH / 2;

      const flash = this.add.graphics().setDepth(10);
      const rColorInt = Phaser.Display.Color.HexStringToColor(RARITY_COLORS[item.rarity] || '#ffffff').color;
      flash.fillStyle(rColorInt, 0.5);
      flash.fillRoundedRect(fx - cellW / 2, fy - cellH / 2, cellW, cellH, 4);

      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 600,
        onComplete: () => flash.destroy(),
      });
    } else {
      this._showLootPopup(item);
    }
  }

  _showLootPopup(item) {
    this._hideLootPopup();

    const container = this.add.container(0, 0).setDepth(40);
    this.lootPopup = container;

    // Backdrop - blocks interaction behind popup
    const backdrop = this.add.rectangle(480, 320, 960, 640, 0x000000, 0.6)
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(0);
    container.add(backdrop);

    // Find the 3 worst items in inventory by score for quick-discard
    const scoredInventory = this.player.inventory
      .map(inv => ({ item: inv, score: getItemScore(inv) }))
      .sort((a, b) => a.score - b.score);
    const worstItems = scoredInventory.slice(0, 3);

    const popW = 360;
    const affixCount = item.affixes ? item.affixes.length : 0;
    const newItemScore = getItemScore(item);
    // Calculate dynamic height: header + item info + affixes + warning + buttons + worst items
    const popH = 210 + affixCount * 16 + worstItems.length * 22 + 20;
    const popX = 300;
    const popY = Math.max(10, 320 - popH / 2);

    // Background with prominent border
    const rarityColorInt = Phaser.Display.Color.HexStringToColor(RARITY_COLORS[item.rarity] || '#ffffff').color;
    const bg = this.add.graphics().setDepth(1);
    bg.fillStyle(0x1a1a2e, 0.98);
    bg.fillRoundedRect(popX, popY, popW, popH, 10);
    bg.lineStyle(2, rarityColorInt, 0.9);
    bg.strokeRoundedRect(popX, popY, popW, popH, 10);
    container.add(bg);

    let cy = popY + 16;

    // NEW ITEM header
    container.add(this.add.text(popX + popW / 2, cy, 'NEW ITEM', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#f0c040',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2));
    cy += 22;

    // Item name (colored by rarity)
    container.add(this.add.text(popX + popW / 2, cy, item.name, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: RARITY_COLORS[item.rarity] || '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2));
    cy += 20;

    // Rarity + slot + score
    container.add(this.add.text(popX + popW / 2, cy, `${item.rarity.toUpperCase()} ${item.slot.toUpperCase()}  |  Score: ${newItemScore.toFixed(1)}`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#888899',
    }).setOrigin(0.5).setDepth(2));
    cy += 16;

    // Separator
    const sep = this.add.graphics().setDepth(2);
    sep.lineStyle(1, 0x333355, 1);
    sep.lineBetween(popX + 15, cy, popX + popW - 15, cy);
    container.add(sep);
    cy += 8;

    // Affixes
    if (item.affixes) {
      for (const affix of item.affixes) {
        container.add(this.add.text(popX + 20, cy, formatAffix(affix), {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#ccddee',
        }).setDepth(2));
        cy += 16;
      }
    }
    cy += 6;

    // INVENTORY FULL warning
    container.add(this.add.text(popX + popW / 2, cy, 'INVENTORY FULL - Make room!', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#e94560',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2));
    cy += 22;

    // Action buttons row
    const btnH = 28;
    const btnGap = 6;

    // Check if item can be equipped (matching slot exists)
    const canEquip = item.slot && Object.values(SLOT).includes(item.slot);

    if (canEquip) {
      // Three buttons: Equip, Discard New, Quick Discard Worst
      const btnW = Math.floor((popW - 40 - btnGap * 2) / 3);
      const eqBtnX = popX + 14;
      this._createTooltipButton(container, eqBtnX, cy, btnW, btnH, 'Equip', 0x2a7a2a, 0x33aa33, () => {
        // Equip the new item directly (swap with equipped)
        const oldItem = this.player.equip(item);
        if (oldItem) {
          this.player.addToInventory(oldItem);
        }
        const stats = this.player.getComputedStats();
        this.player.stats = stats;
        this._hideLootPopup();
        this._refreshAll();
        this._showFloatingMessage(`Equipped ${item.name}`, RARITY_COLORS[item.rarity] || '#ffffff');
      });

      const dBtnX = eqBtnX + btnW + btnGap;
      this._createTooltipButton(container, dBtnX, cy, btnW, btnH, 'Discard New', 0x7a2a2a, 0xaa3333, () => {
        this._hideLootPopup();
        this._showFloatingMessage(`Discarded ${item.name}`, '#888899');
      });

      const qBtnX = dBtnX + btnW + btnGap;
      this._createTooltipButton(container, qBtnX, cy, btnW, btnH, 'Quick Discard', 0x6a4a1a, 0x8a6a2a, () => {
        if (worstItems.length > 0) {
          const worst = worstItems[0].item;
          this.player.removeFromInventory(worst.id);
          this.player.addToInventory(item);
          this._hideLootPopup();
          this._refreshAll();
          this._showFloatingMessage(`Replaced ${worst.name} with ${item.name}`, '#f0c040');
        }
      });
    } else {
      // Two buttons: Discard New, Quick Discard Worst
      const btnW = Math.floor((popW - 40 - btnGap) / 2);
      const dBtnX = popX + 14;
      this._createTooltipButton(container, dBtnX, cy, btnW, btnH, 'Discard New', 0x7a2a2a, 0xaa3333, () => {
        this._hideLootPopup();
        this._showFloatingMessage(`Discarded ${item.name}`, '#888899');
      });

      const qBtnX = dBtnX + btnW + btnGap;
      this._createTooltipButton(container, qBtnX, cy, btnW, btnH, 'Quick Discard Worst', 0x6a4a1a, 0x8a6a2a, () => {
        if (worstItems.length > 0) {
          const worst = worstItems[0].item;
          this.player.removeFromInventory(worst.id);
          this.player.addToInventory(item);
          this._hideLootPopup();
          this._refreshAll();
          this._showFloatingMessage(`Replaced ${worst.name} with ${item.name}`, '#f0c040');
        }
      });
    }
    cy += btnH + 10;

    // Separator before worst items
    const sep2 = this.add.graphics().setDepth(2);
    sep2.lineStyle(1, 0x333355, 1);
    sep2.lineBetween(popX + 15, cy, popX + popW - 15, cy);
    container.add(sep2);
    cy += 8;

    // Worst items section header
    container.add(this.add.text(popX + popW / 2, cy, 'Worst items in inventory:', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#777788',
    }).setOrigin(0.5).setDepth(2));
    cy += 14;

    // List worst items as quick-discard options
    for (const entry of worstItems) {
      const w = entry.item;
      const wColor = RARITY_COLORS[w.rarity] || '#ffffff';
      const wName = w.name.length > 18 ? w.name.substring(0, 17) + '.' : w.name;

      container.add(this.add.text(popX + 20, cy, `[X] ${wName} (${entry.score.toFixed(1)})`, {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: wColor,
      }).setDepth(2));

      const wHit = this.add.rectangle(popX + popW / 2, cy + 6, popW - 30, 18)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.001)
        .setDepth(4);
      container.add(wHit);

      wHit.on('pointerdown', () => {
        this.player.removeFromInventory(w.id);
        this.player.addToInventory(item);
        this._hideLootPopup();
        this._refreshAll();
        this._showFloatingMessage(`Discarded ${w.name}, kept ${item.name}`, '#f0c040');
      });

      cy += 22;
    }
  }

  _hideLootPopup() {
    if (this.lootPopup) {
      this.lootPopup.destroy();
      this.lootPopup = null;
    }
  }

  // ==========================
  // SET BONUSES
  // ==========================

  _updateSetBonuses() {
    for (const t of this.setBonusTexts) {
      if (t && t.destroy) t.destroy();
    }
    this.setBonusTexts = [];

    const equippedItems = Object.values(this.player.equipment).filter(i => i !== null);
    const setCounts = {};
    for (const item of equippedItems) {
      if (item.setId) {
        setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
      }
    }

    // Only show sets with 2+ pieces (1 piece doesn't activate any bonus)
    const activeSets = Object.entries(setCounts).filter(([, count]) => count >= 2);
    if (activeSets.length === 0) return;

    // Draw compactly in the equipment panel area (bottom edge)
    let sy = 295;
    for (const [setId, count] of activeSets) {
      const setDef = ITEM_SETS[setId];
      if (!setDef) continue;

      // Only show the highest active bonus tier, not all thresholds
      let activeBonus = null;
      for (const [threshold, bonus] of Object.entries(setDef.bonuses)) {
        if (count >= Number(threshold)) activeBonus = bonus;
      }

      const label = this.add.text(UI_X + 14, sy, `${setDef.name} (${count}): ${activeBonus ? activeBonus.label : ''}`, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#4ade80',
        fontStyle: 'bold',
      }).setDepth(2);
      this.setBonusTexts.push(label);
      sy += 12;
    }
  }

  // ==========================
  // REFRESH ALL UI
  // ==========================

  _refreshAll() {
    this._updateStatsDisplay();
    this._refreshEquipmentSlots();
    this._refreshInventoryGrid();
    this._updateSetBonuses();
  }

  // ==========================
  // EVENT HANDLERS
  // ==========================

  _onHealthChanged(data) {
    this.player.health = data.health;
    this._updateHealthBar();
  }

  _onStatsChanged(_stats) {
    this._updateStatsDisplay();
  }

  _onPauseToggled(isPaused) {
    // When combat is paused, add visual indicator to UI panel
    if (this._pauseIndicator) {
      this._pauseIndicator.destroy();
      this._pauseIndicator = null;
    }
    if (isPaused) {
      this._pauseIndicator = this.add.text(UI_X + UI_W / 2, 2, '\u23F8 PAUSED - Manage your gear!', {
        fontFamily: 'monospace', fontSize: '11px', color: '#4ade80', fontStyle: 'bold',
      }).setOrigin(0.5, 0).setDepth(100);
    }
  }

  // ==========================
  // FLOATING MESSAGE
  // ==========================

  _showFloatingMessage(text, color) {
    const msg = this.add.text(UI_X + UI_W / 2, 320, text, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: color || '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(50).setAlpha(0);

    this.tweens.add({
      targets: msg,
      alpha: 1,
      y: 290,
      duration: 400,
      hold: 600,
      onComplete: () => {
        this.tweens.add({
          targets: msg,
          alpha: 0,
          y: 260,
          duration: 400,
          onComplete: () => msg.destroy(),
        });
      },
    });
  }
}
