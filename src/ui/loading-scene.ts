import { Text, Container, type Application } from 'pixi.js';
import { BaseScene } from './base-scene.js';
import { EventBus } from './event-bus.js';
import { GameScene } from './types.js';
import { CardAssets } from './card-assets.js';
import { EventAssetLoaded } from '../events/index.js';
import log from 'loglevel'

export class LoadingScene extends BaseScene {
  private loadingContainer: Container;
  private titleText: Text;
  private loadingText: Text;

  constructor(app: Application, eventBus: EventBus) {
    super(app, eventBus, GameScene.LOADING);
    this.loadingContainer = new Container();
    this.titleText = this.createTitleText();
    this.loadingText = this.createLoadingText();
  }

  init(): void {
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

  enter(): void {
    this.visible = true;
    this.loadAssets();
  }

  private async loadAssets() {
    log.debug('LoadingScene: Starting to load assets');
    this.loadingText.text = 'Loading game assets... ';
    const cardAssets = CardAssets.getInstance();
    if (cardAssets.isLoaded()) {
      this.loadingText.text = 'All assets already loaded.';
      this.eventBus.emit(new EventAssetLoaded());
    } else

    cardAssets.loadAll().then(() => {
      this.loadingText.text = 'All assets loaded.';
      this.eventBus.emit(new EventAssetLoaded());
    });
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
