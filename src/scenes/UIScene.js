import Phaser from 'phaser';
import { RARITY_COLORS, INVENTORY_COLS, INVENTORY_ROWS, SLOT, RARITY_ORDER } from '../data/constants.js';
import { compareItems, formatAffix, getItemScore } from '../systems/InventorySystem.js';

/**
 * UIScene - Inventory, equipment, and stats overlay running in parallel with GameScene.
 * Occupies the right side of the screen (500-960px).
 */
export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  init(data) {
    this.player = data.player;
  }

  create() {
    const panelX = 505;
    const panelW = 450;

    // Semi-transparent background for the UI panel
    const bg = this.add.graphics();
    bg.fillStyle(0x16213e, 0.92);
    bg.fillRect(500, 0, 460, 640);
    bg.lineStyle(2, 0x333355, 1);
    bg.lineBetween(500, 0, 500, 640);

    // ---- STATS PANEL (top section) ----
    this.add.text(panelX + panelW / 2, 12, 'STATS', {
      fontFamily: 'monospace', fontSize: '14px', color: '#e94560', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);

    this.statLabels = {};
    const statDefs = [
      { key: 'maxHealth', label: 'HP', fmt: v => Math.ceil(v) },
      { key: 'attack', label: 'ATK', fmt: v => Math.ceil(v) },
      { key: 'defense', label: 'DEF', fmt: v => Math.ceil(v) },
      { key: 'attackSpeed', label: 'SPD', fmt: v => v.toFixed(2) },
      { key: 'critChance', label: 'CRT%', fmt: v => (v * 100).toFixed(1) + '%' },
      { key: 'critDamage', label: 'CRT×', fmt: v => v.toFixed(2) + 'x' },
      { key: 'fireDamage', label: 'FIRE', fmt: v => Math.ceil(v), color: '#f97316' },
      { key: 'iceDamage', label: 'ICE', fmt: v => Math.ceil(v), color: '#60a5fa' },
      { key: 'poisonDamage', label: 'PSN', fmt: v => Math.ceil(v), color: '#4ade80' },
    ];

    const cols = 3;
    const statStartX = panelX + 15;
    const statStartY = 32;
    const statColW = 145;
    const statRowH = 18;

    statDefs.forEach((def, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = statStartX + col * statColW;
      const y = statStartY + row * statRowH;

      this.add.text(x, y, def.label + ':', {
        fontFamily: 'monospace', fontSize: '11px', color: '#888899',
      }).setDepth(2);

      this.statLabels[def.key] = this.add.text(x + 42, y, '', {
        fontFamily: 'monospace', fontSize: '11px', color: def.color || '#ffffff',
      }).setDepth(2);
    });

    this.statDefs = statDefs;
    this._refreshStats();

    // ---- Gold display ----
    this.goldText = this.add.text(panelX + panelW - 10, 14, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#f0c040',
    }).setOrigin(1, 0).setDepth(2);
    this._updateGold();

    // ---- EQUIPMENT PANEL (middle section) ----
    const equipY = 95;
    this.add.text(panelX + panelW / 2, equipY, 'EQUIPMENT', {
      fontFamily: 'monospace', fontSize: '13px', color: '#e94560', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);

    // Draw separator line
    const sepG = this.add.graphics().setDepth(1);
    sepG.lineStyle(1, 0x333355, 0.6);
    sepG.lineBetween(panelX, equipY - 5, panelX + panelW, equipY - 5);

    const equipSlots = [
      { key: SLOT.WEAPON, label: 'Weapon', eqKey: SLOT.WEAPON },
      { key: SLOT.HELMET, label: 'Helmet', eqKey: SLOT.HELMET },
      { key: SLOT.CHEST, label: 'Chest', eqKey: SLOT.CHEST },
      { key: SLOT.GLOVES, label: 'Gloves', eqKey: SLOT.GLOVES },
      { key: SLOT.BOOTS, label: 'Boots', eqKey: SLOT.BOOTS },
      { key: 'ring1', label: 'Ring 1', eqKey: 'ring1' },
      { key: 'ring2', label: 'Ring 2', eqKey: 'ring2' },
    ];

    this.equipmentSlots = [];
    const eqStartY = equipY + 18;
    const eqRowH = 26;
    const eqLabelX = panelX + 12;
    const eqItemX = panelX + 75;

    equipSlots.forEach((slot, i) => {
      const y = eqStartY + i * eqRowH;

      this.add.text(eqLabelX, y, slot.label, {
        fontFamily: 'monospace', fontSize: '11px', color: '#666688',
      }).setDepth(2);

      const itemText = this.add.text(eqItemX, y, 'Empty', {
        fontFamily: 'monospace', fontSize: '11px', color: '#444466',
      }).setDepth(2).setInteractive({ useHandCursor: true });

      itemText.on('pointerdown', () => this._onEquipmentClick(slot.eqKey));
      itemText.on('pointerover', () => itemText.setAlpha(0.7));
      itemText.on('pointerout', () => itemText.setAlpha(1));

      this.equipmentSlots.push({ slot, text: itemText });
    });

    this._refreshEquipment();

    // ---- INVENTORY GRID (bottom section) ----
    const invY = 310;
    this.add.text(panelX + panelW / 2, invY, 'INVENTORY', {
      fontFamily: 'monospace', fontSize: '13px', color: '#e94560', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);

    const sepG2 = this.add.graphics().setDepth(1);
    sepG2.lineStyle(1, 0x333355, 0.6);
    sepG2.lineBetween(panelX, invY - 5, panelX + panelW, invY - 5);

    const cellW = 100;
    const cellH = 72;
    const cellPad = 6;
    const gridStartX = panelX + (panelW - INVENTORY_COLS * (cellW + cellPad) + cellPad) / 2;
    const gridStartY = invY + 18;

    this.inventoryCells = [];
    this.inventoryGfx = this.add.graphics().setDepth(1);

    for (let row = 0; row < INVENTORY_ROWS; row++) {
      for (let col = 0; col < INVENTORY_COLS; col++) {
        const x = gridStartX + col * (cellW + cellPad);
        const y = gridStartY + row * (cellH + cellPad);
        const idx = row * INVENTORY_COLS + col;

        const nameText = this.add.text(x + cellW / 2, y + 14, '', {
          fontFamily: 'monospace', fontSize: '10px', color: '#ffffff',
          align: 'center', wordWrap: { width: cellW - 8 },
        }).setOrigin(0.5).setDepth(3);

        const slotText = this.add.text(x + cellW / 2, y + 34, '', {
          fontFamily: 'monospace', fontSize: '9px', color: '#888899',
        }).setOrigin(0.5).setDepth(3);

        const scoreText = this.add.text(x + cellW / 2, y + 50, '', {
          fontFamily: 'monospace', fontSize: '9px', color: '#666688',
        }).setOrigin(0.5).setDepth(3);

        const hitArea = this.add.rectangle(x + cellW / 2, y + cellH / 2, cellW, cellH)
          .setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0.001).setDepth(4);

        hitArea.on('pointerdown', () => this._onInventoryClick(idx));

        this.inventoryCells.push({
          x, y, w: cellW, h: cellH,
          nameText, slotText, scoreText, hitArea,
        });
      }
    }

    this._refreshInventory();

    // ---- Set bonus display ----
    this.setBonusText = this.add.text(panelX + panelW / 2, 285, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#c084fc',
      align: 'center', wordWrap: { width: panelW - 20 },
    }).setOrigin(0.5).setDepth(2);
    this._refreshSetBonuses();

    // ---- Tooltip overlay (hidden by default) ----
    this.tooltipContainer = null;

    // ---- Listen for events from GameScene ----
    const gameScene = this.scene.get('GameScene');
    if (gameScene) {
      gameScene.events.on('lootDrop', this._onLootDrop, this);
      gameScene.events.on('statsChanged', this._onStatsChanged, this);
      gameScene.events.on('playerHealthChanged', this._onHealthChanged, this);
    }
  }

  // ---- Refresh helpers ----

  _refreshStats() {
    if (!this.player) return;
    const stats = this.player.getComputedStats();
    for (const def of this.statDefs) {
      const label = this.statLabels[def.key];
      if (label) {
        const val = stats[def.key] || 0;
        label.setText(def.fmt(val));
      }
    }
  }

  _updateGold() {
    if (this.goldText && this.player) {
      this.goldText.setText(`${this.player.gold}g`);
    }
  }

  _refreshEquipment() {
    if (!this.player) return;
    for (const entry of this.equipmentSlots) {
      const item = this.player.equipment[entry.slot.eqKey];
      if (item) {
        entry.text.setText(item.name);
        entry.text.setColor(RARITY_COLORS[item.rarity] || '#ffffff');
      } else {
        entry.text.setText('Empty');
        entry.text.setColor('#444466');
      }
    }
  }

  _refreshInventory() {
    if (!this.player) return;
    this.inventoryGfx.clear();

    for (let i = 0; i < this.inventoryCells.length; i++) {
      const cell = this.inventoryCells[i];
      const item = this.player.inventory[i];

      // Draw cell border
      const hasItem = !!item;
      this.inventoryGfx.lineStyle(1, hasItem ? 0x555577 : 0x333355, hasItem ? 0.8 : 0.4);
      this.inventoryGfx.fillStyle(hasItem ? 0x1a1a3e : 0x12122a, 0.8);
      this.inventoryGfx.fillRoundedRect(cell.x, cell.y, cell.w, cell.h, 4);
      this.inventoryGfx.strokeRoundedRect(cell.x, cell.y, cell.w, cell.h, 4);

      if (item) {
        // Rarity colored left border
        const rarityColor = Phaser.Display.Color.HexStringToColor(RARITY_COLORS[item.rarity] || '#ffffff').color;
        this.inventoryGfx.fillStyle(rarityColor, 0.7);
        this.inventoryGfx.fillRect(cell.x, cell.y + 2, 3, cell.h - 4);

        cell.nameText.setText(item.name).setColor(RARITY_COLORS[item.rarity] || '#ffffff');
        cell.slotText.setText(item.slot);
        cell.scoreText.setText(`Score: ${getItemScore(item)}`);
      } else {
        cell.nameText.setText('');
        cell.slotText.setText('');
        cell.scoreText.setText('');
      }
    }
  }

  _refreshSetBonuses() {
    if (!this.player) return;
    const equippedItems = Object.values(this.player.equipment).filter(i => i !== null);
    const setCounts = {};
    for (const item of equippedItems) {
      if (item.setId) {
        setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
      }
    }

    const lines = [];
    for (const [setId, count] of Object.entries(setCounts)) {
      lines.push(`${setId} (${count}pc)`);
    }
    this.setBonusText.setText(lines.length > 0 ? 'Sets: ' + lines.join(' | ') : '');
  }

  _refreshAll() {
    this._refreshStats();
    this._refreshEquipment();
    this._refreshInventory();
    this._refreshSetBonuses();
    this._updateGold();
  }

  // ---- Event handlers ----

  _onLootDrop(data) {
    const { item } = data;

    if (!this.player.isInventoryFull()) {
      this.player.addToInventory(item);
      this._refreshInventory();

      // Flash the new cell
      const idx = this.player.inventory.length - 1;
      if (idx < this.inventoryCells.length) {
        const cell = this.inventoryCells[idx];
        const flash = this.add.graphics().setDepth(5);
        const rarityColor = Phaser.Display.Color.HexStringToColor(RARITY_COLORS[item.rarity] || '#ffffff').color;
        flash.fillStyle(rarityColor, 0.4);
        flash.fillRoundedRect(cell.x, cell.y, cell.w, cell.h, 4);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 600,
          onComplete: () => flash.destroy(),
        });
      }
    } else {
      // Inventory full - show loot popup forcing a decision
      this._showLootFullPopup(item);
    }
  }

  _onStatsChanged() {
    this._refreshStats();
  }

  _onHealthChanged() {
    this._refreshStats();
  }

  // ---- Equipment click ----

  _onEquipmentClick(eqKey) {
    const item = this.player.equipment[eqKey];
    if (!item) return;

    if (this.player.isInventoryFull()) {
      // Can't unequip if inventory is full
      this._showFlashMessage('Inventory full!', '#e94560');
      return;
    }

    // Unequip to inventory
    const unequipped = this.player.unequip(eqKey);
    if (unequipped) {
      this.player.addToInventory(unequipped);
      // Refresh stats on game scene player
      this.player.stats = this.player.getComputedStats();
      this._refreshAll();
    }
  }

  // ---- Inventory click (show tooltip) ----

  _onInventoryClick(idx) {
    const item = this.player.inventory[idx];
    if (!item) return;
    this._showItemTooltip(item, idx);
  }

  // ---- Item tooltip ----

  _showItemTooltip(item, invIdx) {
    this._destroyTooltip();

    const { width, height } = this.scale;
    const container = this.add.container(0, 0).setDepth(30);
    this.tooltipContainer = container;

    // Backdrop
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5)
      .setOrigin(0.5).setInteractive().setDepth(0);
    overlay.on('pointerdown', () => this._destroyTooltip());
    container.add(overlay);

    const tipW = 340;
    const tipH = 360;
    const tipX = (width - tipW) / 2;
    const tipY = (height - tipH) / 2;

    // Panel bg
    const panelBg = this.add.graphics().setDepth(1);
    panelBg.fillStyle(0x0f1025, 1);
    panelBg.fillRoundedRect(tipX, tipY, tipW, tipH, 10);
    panelBg.lineStyle(2, Phaser.Display.Color.HexStringToColor(RARITY_COLORS[item.rarity] || '#ffffff').color, 0.8);
    panelBg.strokeRoundedRect(tipX, tipY, tipW, tipH, 10);
    container.add(panelBg);

    // Item name
    const nameText = this.add.text(tipX + tipW / 2, tipY + 20, item.name, {
      fontFamily: 'monospace', fontSize: '18px',
      color: RARITY_COLORS[item.rarity] || '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);
    container.add(nameText);

    // Rarity + slot
    const rarityLabel = item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1);
    const slotLabel = item.slot.charAt(0).toUpperCase() + item.slot.slice(1);
    const subtitleText = this.add.text(tipX + tipW / 2, tipY + 44, `${rarityLabel} ${slotLabel}`, {
      fontFamily: 'monospace', fontSize: '11px', color: '#888899',
    }).setOrigin(0.5).setDepth(2);
    container.add(subtitleText);

    // Set name
    if (item.setId) {
      const setLabel = this.add.text(tipX + tipW / 2, tipY + 60, `Set: ${item.setId}`, {
        fontFamily: 'monospace', fontSize: '11px', color: '#c084fc',
      }).setOrigin(0.5).setDepth(2);
      container.add(setLabel);
    }

    // Affixes
    const affixStartY = tipY + (item.setId ? 80 : 68);
    if (item.affixes) {
      item.affixes.forEach((affix, i) => {
        const affixText = this.add.text(tipX + 20, affixStartY + i * 18, formatAffix(affix), {
          fontFamily: 'monospace', fontSize: '12px', color: '#ddddee',
        }).setDepth(2);
        container.add(affixText);
      });
    }

    // ---- Comparison with equipped item ----
    const eqKey = item.slot === 'ring' ? 'ring1' : item.slot;
    const currentItem = this.player.equipment[eqKey];
    const comparison = compareItems(currentItem, item, this.player.getComputedStats());

    const compY = affixStartY + (item.affixes ? item.affixes.length : 0) * 18 + 12;

    if (currentItem) {
      this.add.text(tipX + tipW / 2, compY, '--- vs Equipped ---', {
        fontFamily: 'monospace', fontSize: '10px', color: '#666688',
      }).setOrigin(0.5).setDepth(2);
      container.add(this.children.list[this.children.list.length - 1]);

      comparison.changes.forEach((change, i) => {
        if (change.diff === 0) return;
        const arrow = change.better ? '+' : '';
        const color = change.better ? '#4ade80' : '#e94560';
        const diffVal = typeof change.diff === 'number' ? (Number.isInteger(change.diff) ? change.diff : change.diff.toFixed(1)) : change.diff;
        const cText = this.add.text(tipX + 20, compY + 16 + i * 16, `${change.stat}: ${arrow}${diffVal}`, {
          fontFamily: 'monospace', fontSize: '11px', color,
        }).setDepth(2);
        container.add(cText);
      });
    } else {
      const emptyText = this.add.text(tipX + tipW / 2, compY, 'Slot is empty', {
        fontFamily: 'monospace', fontSize: '11px', color: '#4ade80',
      }).setOrigin(0.5).setDepth(2);
      container.add(emptyText);
    }

    // ---- Buttons ----
    const btnY = tipY + tipH - 50;

    // Equip button
    this._createTooltipButton(container, tipX + tipW / 4, btnY, 100, 34, 'Equip', 0x2a7a2a, () => {
      this.player.removeFromInventory(item.id);
      const old = this.player.equip(item);
      if (old) this.player.addToInventory(old);
      this.player.stats = this.player.getComputedStats();
      this._refreshAll();
      this._destroyTooltip();
    });

    // Discard button
    this._createTooltipButton(container, tipX + 3 * tipW / 4, btnY, 100, 34, 'Discard', 0x773333, () => {
      this.player.removeFromInventory(item.id);
      this._refreshAll();
      this._destroyTooltip();
    });
  }

  _createTooltipButton(container, x, y, w, h, label, color, onClick) {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(color, 1);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    g.lineStyle(1, 0xaaaacc, 0.3);
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);
    container.add(g);

    const text = this.add.text(x, y, label, {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3);
    container.add(text);

    const hitArea = this.add.rectangle(x, y, w, h)
      .setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0.001).setDepth(4);
    hitArea.on('pointerdown', onClick);
    hitArea.on('pointerover', () => text.setScale(1.05));
    hitArea.on('pointerout', () => text.setScale(1));
    container.add(hitArea);
  }

  // ---- Loot full popup ----

  _showLootFullPopup(item) {
    this._destroyTooltip();

    const { width, height } = this.scale;
    const container = this.add.container(0, 0).setDepth(30);
    this.tooltipContainer = container;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5)
      .setOrigin(0.5).setInteractive().setDepth(0);
    container.add(overlay);

    const tipW = 320;
    const tipH = 240;
    const tipX = (width - tipW) / 2;
    const tipY = (height - tipH) / 2;

    const panelBg = this.add.graphics().setDepth(1);
    panelBg.fillStyle(0x0f1025, 1);
    panelBg.fillRoundedRect(tipX, tipY, tipW, tipH, 10);
    panelBg.lineStyle(2, 0xe94560, 0.8);
    panelBg.strokeRoundedRect(tipX, tipY, tipW, tipH, 10);
    container.add(panelBg);

    // Warning
    const warnText = this.add.text(tipX + tipW / 2, tipY + 20, 'INVENTORY FULL!', {
      fontFamily: 'monospace', fontSize: '16px', color: '#e94560', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);
    container.add(warnText);

    // Item name
    const nameText = this.add.text(tipX + tipW / 2, tipY + 50, item.name, {
      fontFamily: 'monospace', fontSize: '16px',
      color: RARITY_COLORS[item.rarity] || '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);
    container.add(nameText);

    // Affixes
    if (item.affixes) {
      item.affixes.forEach((affix, i) => {
        const aText = this.add.text(tipX + 20, tipY + 75 + i * 16, formatAffix(affix), {
          fontFamily: 'monospace', fontSize: '11px', color: '#ccccdd',
        }).setDepth(2);
        container.add(aText);
      });
    }

    // Discard new item button
    const btnY = tipY + tipH - 50;
    this._createTooltipButton(container, tipX + tipW / 2, btnY, 160, 34, 'Discard Item', 0x773333, () => {
      this._destroyTooltip();
    });
  }

  // ---- Flash message ----

  _showFlashMessage(msg, color) {
    const { width } = this.scale;
    const flashText = this.add.text(width / 2, 300, msg, {
      fontFamily: 'monospace', fontSize: '14px', color: color || '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    this.tweens.add({
      targets: flashText,
      alpha: 1,
      duration: 200,
      hold: 600,
      onComplete: () => {
        this.tweens.add({
          targets: flashText,
          alpha: 0,
          y: 280,
          duration: 300,
          onComplete: () => flashText.destroy(),
        });
      },
    });
  }

  _destroyTooltip() {
    if (this.tooltipContainer) {
      this.tooltipContainer.destroy();
      this.tooltipContainer = null;
    }
  }

  update() {
    // Periodically refresh gold display
    this._updateGold();
  }
}
