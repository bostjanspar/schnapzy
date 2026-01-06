import { Text, Container, type Application } from 'pixi.js';
import { BaseScene } from './base-scene.js';
import { EventBus} from './event-bus.js';
import { EventStartGame } from '../events/index.js';
import { GameScene } from './types.js';

export class StartMenuScene extends BaseScene {
  private menuContainer: Container;
  private titleText: Text;
  private startButtonText: Text;
  //private selectedLanguage: string = 'en';

  constructor(app: Application, eventBus: EventBus) {
    super(app, eventBus, GameScene.START_MENU);
    this.menuContainer = new Container();
    this.titleText = this.createTitleText();
    this.startButtonText = this.createStartButtonText();
  }

  init(): void {
    // Position container in center
    this.menuContainer.x = this.app.screen.width / 2;
    this.menuContainer.y = this.app.screen.height / 2;

    // Add title
    this.titleText.anchor.set(0.5);
    this.titleText.y = -100;
    this.menuContainer.addChild(this.titleText);

    // Add start button (placeholder - will be clickable with @pixi/ui)
    this.startButtonText.anchor.set(0.5);
    this.startButtonText.y = 50;
    this.startButtonText.eventMode = 'static';
    this.startButtonText.cursor = 'pointer';
    this.startButtonText.on('pointerdown', this.onStartClicked);
    this.menuContainer.addChild(this.startButtonText);

    this.addChild(this.menuContainer);

    // Handle window resize
    window.addEventListener('resize', this.handleResize);
  }

  enter(): void {
    this.visible = true;
  }

  private onStartClicked = (): void => {
    // Notify State Machine that start was clicked
    this.eventBus.emit(new EventStartGame());

  };

  exit(): void {
    this.visible = false;
  }

  update(_delta: number): void {
    // UI animations if needed
  }

  private handleResize = (): void => {
    this.menuContainer.x = this.app.screen.width / 2;
    this.menuContainer.y = this.app.screen.height / 2;
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

  private createStartButtonText(): Text {
    return new Text({
      text: 'START GAME',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0x00ff00,
        align: 'center',
      },
    });
  }

  override destroy(): void {
    this.startButtonText.off('pointerdown', this.onStartClicked);
    window.removeEventListener('resize', this.handleResize);
    super.destroy();
  }
}
