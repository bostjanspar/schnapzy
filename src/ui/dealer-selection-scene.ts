import { Text, Container, type Application } from 'pixi.js';
import { BaseScene } from './base-scene.js';
import { EventBus } from './event-bus.js';
import { GameScene } from './types.js';

export class DealerSelectionScene extends BaseScene {
  private container: Container;
  private infoText: Text;

  constructor(app: Application, eventBus: EventBus) {
    super(app, eventBus, GameScene.DEALER_SELECTION);
    this.container = new Container();
    this.infoText = this.createInfoText();
  }

  init(): void {
    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;

    this.infoText.anchor.set(0.5);
    this.container.addChild(this.infoText);

    this.addChild(this.container);

    window.addEventListener('resize', this.handleResize);
  }

  enter(_data?: unknown): void {
    this.visible = true;
    this.startDealerSelection();
  }

  private startDealerSelection(): void {
    // TODO: Implement dealer selection animation
    // - Shuffle animation
    // - Card flip for each player
    // - Highlight selected dealer

    this.infoText.text = 'Selecting dealer...';

    // Simulate animation delay
    setTimeout(() => {
      this.infoText.text = 'Dealer selected!';

      // Simulate elected dealer (should come from game logic)

      // Notify State Machine that animation is complete
      
    }, 2000);
  }

  exit(): void {
    this.visible = false;
  }

  update(_delta: number): void {
    // Update dealer selection animation
  }

  private handleResize = (): void => {
    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;
  };

  private createInfoText(): Text {
    return new Text({
      text: 'Selecting dealer...',
      style: {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0xffffff,
        align: 'center',
      },
    });
  }

  override destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    super.destroy();
  }
}
