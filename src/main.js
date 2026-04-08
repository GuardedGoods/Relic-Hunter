import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { ClassSelectScene } from './scenes/ClassSelectScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';
import { PostRunScene } from './scenes/PostRunScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: '#1a1a2e',
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MainMenuScene, ClassSelectScene, GameScene, UIScene, PostRunScene],
};

new Phaser.Game(config);
