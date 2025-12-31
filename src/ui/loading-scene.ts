/**
 * Loading scene - displays loading progress and loads game assets.
 * Emits ASSET_LOADED when loading is complete.
 */

import { Text, Container, type Application } from 'pixi.js';
import { BaseScene } from './base-scene.js';
import { EventBus } from './event-bus.js';
import { GAME_EVENT_IDS } from '../events/index.js';
import { GameScene } from './types.js';

export class LoadingScene extends BaseScene {
  private loadingContainer: Container;
  private titleText: Text;
  private loadingText: Text;
  private loadingProgress: number = 0;

  constructor(app: Application, eventBus: EventBus) {
    super(app, eventBus, GameScene.LOADING);
    this.loadingContainer = new Container();
    this.titleText = this.createTitleText();
    this.loadingText = this.createLoadingText();
  }

  async init(): Promise<void> {
    // Position container in center
    this.loadingContainer.x = this.app.screen.width / 2;
    this.loadingContainer.y = this.app.screen.height / 2;

    // Add text elements
    this.titleText.anchor.set(0.5);
    this.loadingContainer.addChild(this.titleText);

    this.loadingText.anchor.set(0.5);
    this.loadingText.y = 60;
    this.loadingContainer.addChild(this.loadingText);

    this.addChild(this.loadingContainer);

    // Handle window resize
    window.addEventListener('resize', this.handleResize);
  }

  enter(_data?: unknown): void {
    this.visible = true;
    this.loadingProgress = 0;
    this.loadAssets();
  }

  private async loadAssets(): Promise<void> {
    // TODO: Implement actual asset loading
    // - Load card textures
    // - Load sound effects
    // - Load fonts
    // - Update loading progress

    // Simulate loading for now
    this.loadingText.text = 'Loading game assets... 0%';

    const loadingInterval = setInterval(() => {
      this.loadingProgress += 10;
      this.loadingText.text = `Loading game assets... ${this.loadingProgress}%`;

      if (this.loadingProgress >= 100) {
        clearInterval(loadingInterval);
        // Notify State Machine that loading is complete
        this.eventBus.emit(GAME_EVENT_IDS.ASSET_LOADED);
      }
    }, 100);
  }

  exit(): void {
    this.visible = false;
  }

  update(_delta: number): void {
    // Update loading animations if needed
  }

  private handleResize = (): void => {
    this.loadingContainer.x = this.app.screen.width / 2;
    this.loadingContainer.y = this.app.screen.height / 2;
  };

  private createTitleText(): Text {
    return new Text({
      text: 'SCHNAPZY',
      style: {
        fontFamily: 'Arial',
        fontSize: 48,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
      },
    });
  }

  private createLoadingText(): Text {
    return new Text({
      text: 'Loading game assets...',
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0xaaaaaa,
        align: 'center',
      },
    });
  }

  override destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    super.destroy();
  }
}
