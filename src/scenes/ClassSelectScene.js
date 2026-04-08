import Phaser from 'phaser';
import { CLASSES } from '../data/classes.js';

export class ClassSelectScene extends Phaser.Scene {
  constructor() {
    super('ClassSelectScene');
  }

  init(data) {
    this.saveData = data.saveData || null;
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

    // ---- Title ----
    this.add.text(width / 2, 36, 'SELECT YOUR CLASS', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#e94560',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5).setShadow(0, 0, '#e94560', 8, true, true);

    // ---- Render class cards ----
    const classIds = Object.keys(CLASSES);
    const cardW = 860;
    const cardH = 480;
    const cardX = (width - cardW) / 2;
    const cardY = 70;

    classIds.forEach((classId, index) => {
      this._renderClassCard(classId, CLASSES[classId], cardX, cardY, cardW, cardH);
    });
  }

  _renderClassCard(classId, cls, cardX, cardY, cardW, cardH) {
    const { width, height } = this.scale;

    // ---- Dark panel background ----
    const panel = this.add.graphics().setDepth(2);
    panel.fillStyle(0x16213e, 0.95);
    panel.fillRoundedRect(cardX, cardY, cardW, cardH, 12);
    panel.lineStyle(2, Phaser.Display.Color.HexStringToColor(cls.color).color, 0.8);
    panel.strokeRoundedRect(cardX, cardY, cardW, cardH, 12);

    // ---- Left side: Class info ----
    const leftX = cardX + 40;
    const leftCenterX = cardX + 180;

    // Class icon (large)
    this.add.text(leftCenterX, cardY + 50, cls.icon, {
      fontFamily: 'monospace',
      fontSize: '64px',
    }).setOrigin(0.5).setDepth(5);

    // Class name
    this.add.text(leftCenterX, cardY + 100, cls.name.toUpperCase(), {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: cls.color,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5);

    // Class description
    this.add.text(leftCenterX, cardY + 135, cls.description, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#aaaacc',
      wordWrap: { width: 280 },
      align: 'center',
    }).setOrigin(0.5, 0).setDepth(5);

    // ---- Resource info ----
    const res = cls.resource;
    this.add.text(leftCenterX, cardY + 185, `Resource: ${res.name} (max ${res.max})`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: res.color,
    }).setOrigin(0.5).setDepth(5);

    this.add.text(leftCenterX, cardY + 205, `Decays ${res.decay}/sec after ${res.decayDelay / 1000}s`, {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#888899',
    }).setOrigin(0.5).setDepth(5);

    // ---- Stat bonuses ----
    const bonuses = cls.baseStatBonuses;
    const bonusStr = Object.entries(bonuses).map(([k, v]) => `+${v} ${k}`).join('  ');
    this.add.text(leftCenterX, cardY + 230, bonusStr, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#4ade80',
    }).setOrigin(0.5).setDepth(5);

    // ---- Talent trees (below class info on the left) ----
    this.add.text(leftCenterX, cardY + 270, 'TALENT TREES', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5);

    const treeKeys = Object.keys(cls.talents);
    treeKeys.forEach((treeKey, i) => {
      const tree = cls.talents[treeKey];
      const ty = cardY + 300 + i * 50;

      // Tree icon + name
      this.add.text(leftX, ty, `${tree.icon} ${tree.name}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: tree.color,
        fontStyle: 'bold',
      }).setDepth(5);

      // Tree description
      this.add.text(leftX + 10, ty + 18, tree.description, {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#888899',
        wordWrap: { width: 280 },
      }).setDepth(5);
    });

    // ---- Right side: Abilities ----
    const rightX = cardX + 380;

    this.add.text(rightX + 200, cardY + 30, 'ABILITIES', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5);

    cls.abilities.forEach((ability, i) => {
      const ay = cardY + 60 + i * 120;
      this._renderAbilityCard(rightX, ay, ability);
    });

    // ---- Begin Run button ----
    const btnW = 220;
    const btnH = 48;
    const btnX = width / 2;
    const btnY = cardY + cardH - 40;

    this._createButton(btnX, btnY, btnW, btnH, `Select ${cls.name}`, cls.color, classId);
  }

  _renderAbilityCard(x, y, ability) {
    const cardW = 400;
    const cardH = 100;

    // Background
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x0f3460, 0.6);
    g.fillRoundedRect(x, y, cardW, cardH, 8);
    g.lineStyle(1, ability.color, 0.5);
    g.strokeRoundedRect(x, y, cardW, cardH, 8);

    // Icon
    this.add.text(x + 30, y + 20, ability.icon, {
      fontFamily: 'monospace',
      fontSize: '32px',
    }).setOrigin(0.5).setDepth(5);

    // Hotkey badge
    this.add.text(x + 30, y + 50, `[${ability.hotkey}]`, {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#f0c040',
    }).setOrigin(0.5).setDepth(5);

    // Name
    this.add.text(x + 60, y + 10, ability.name, {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setDepth(5);

    // Description
    this.add.text(x + 60, y + 32, ability.description, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ccccdd',
      lineSpacing: 2,
    }).setDepth(5);

    // Cooldown
    const cdStr = `${(ability.cooldown / 1000).toFixed(0)}s CD`;
    this.add.text(x + cardW - 15, y + 12, cdStr, {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#60a5fa',
    }).setOrigin(1, 0).setDepth(5);

    // Fury cost / generation
    const furyStr = ability.furyCost < 0
      ? `+${Math.abs(ability.furyCost)} Fury`
      : `${ability.furyCost} Fury`;
    const furyColor = ability.furyCost < 0 ? '#4ade80' : '#e94560';
    this.add.text(x + cardW - 15, y + 28, furyStr, {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: furyColor,
    }).setOrigin(1, 0).setDepth(5);
  }

  _createButton(x, y, w, h, label, colorStr, classId) {
    const bgColor = typeof colorStr === 'string'
      ? Phaser.Display.Color.HexStringToColor(colorStr).color
      : colorStr;

    const g = this.add.graphics().setDepth(5);
    g.fillStyle(bgColor, 1);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    g.lineStyle(2, 0xffffff, 0.3);
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);

    const text = this.add.text(x, y, label, {
      fontFamily: 'monospace',
      fontSize: '24px',
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
      g.lineStyle(2, 0xffffff, 0.6);
      g.strokeRoundedRect(x - w / 2 - 2, y - h / 2 - 2, w + 4, h + 4, 10);
    });

    hitArea.on('pointerout', () => {
      text.setScale(1);
      g.clear();
      g.fillStyle(bgColor, 1);
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
      g.lineStyle(2, 0xffffff, 0.3);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    });

    hitArea.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0x1a, 0x1a, 0x2e);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene', {
          zone: this.registry.get('selectedZone') || undefined,
          saveData: this.saveData,
          classId: classId,
        });
      });
    });

    return { graphics: g, text, hitArea };
  }
}
