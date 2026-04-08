import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    const { width, height } = this.scale;

    // Dark gradient background
    const bg = this.add.graphics();
    for (let y = 0; y < height; y++) {
      const t = y / height;
      const r = Phaser.Math.Linear(0x1a, 0x10, t);
      const g = Phaser.Math.Linear(0x1a, 0x0e, t);
      const b = Phaser.Math.Linear(0x2e, 0x20, t);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      bg.fillRect(0, y, width, 1);
    }

    // Title text with glow
    const title = this.add.text(width / 2, height / 2 - 90, 'RELIC HUNTER', {
      fontFamily: 'monospace',
      fontSize: '52px',
      color: '#e94560',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    title.setShadow(0, 0, '#e94560', 16, true, true);

    // Pulsing title
    this.tweens.add({
      targets: title,
      alpha: { from: 0.6, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // "Loading..." text
    this.add.text(width / 2, height / 2 - 30, 'Loading...', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#aaaacc',
    }).setOrigin(0.5);

    // Loading bar background
    const barX = width / 2 - 160;
    const barY = height / 2 + 10;
    const barWidth = 320;
    const barHeight = 22;

    const barBg = this.add.graphics();
    barBg.fillStyle(0x0f3460, 1);
    barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 6);
    barBg.lineStyle(1, 0x334477, 1);
    barBg.strokeRoundedRect(barX, barY, barWidth, barHeight, 6);

    // Loading bar fill (animated)
    const barFill = this.add.graphics();

    // Initialize global game state on registry
    this.registry.set('runStats', null);
    this.registry.set('selectedZone', 'ashveil');
    this.registry.set('currentDepth', 0);
    this.registry.set('enemiesKilled', 0);
    this.registry.set('itemsFound', []);
    this.registry.set('goldEarned', 0);

    // Decorative floating dots
    const dots = [];
    for (let i = 0; i < 15; i++) {
      const dot = this.add.graphics();
      const size = Phaser.Math.FloatBetween(1, 2.5);
      dot.fillStyle(0x4444aa, Phaser.Math.FloatBetween(0.15, 0.35));
      dot.fillCircle(0, 0, size);
      const dx = Phaser.Math.Between(0, width);
      const dy = Phaser.Math.Between(0, height);
      dot.setPosition(dx, dy);
      dots.push({ g: dot, speed: Phaser.Math.FloatBetween(0.2, 0.6), x: dx, y: dy });
    }

    // Animate the loading bar
    const loadDuration = 1500;
    const startTime = this.time.now;

    this.time.addEvent({
      delay: 16,
      repeat: Math.ceil(loadDuration / 16),
      callback: () => {
        const progress = Math.min(1, (this.time.now - startTime) / loadDuration);
        barFill.clear();
        barFill.fillStyle(0xe94560, 1);
        const fillW = (barWidth - 4) * progress;
        if (fillW > 0) {
          barFill.fillRoundedRect(barX + 2, barY + 2, fillW, barHeight - 4, 4);
        }

        // Animate dots
        for (const d of dots) {
          d.y -= d.speed;
          if (d.y < -10) {
            d.y = height + 10;
            d.x = Phaser.Math.Between(0, width);
          }
          d.g.setPosition(d.x, d.y);
        }
      },
    });

    // Transition to MainMenuScene after the loading bar completes
    this.time.delayedCall(loadDuration + 400, () => {
      this.cameras.main.fadeOut(400, 0x1a, 0x1a, 0x2e);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });
  }
}
