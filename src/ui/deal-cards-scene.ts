/**
 * Deal cards scene - animates dealing cards to players.
 * Emits DEAL_ANIM_COMPLETE when deal animation finishes.
 */

import { Text, Container, type Application } from 'pixi.js';
import { BaseScene } from './base-scene.js';
import { EventBus } from './event-bus.js';
import { GAME_EVENT_IDS } from '../events/index.js';
import { GameScene } from './types.js';

export class DealCardsScene extends BaseScene {
  private container: Container;
  private infoText: Text;

  constructor(app: Application, eventBus: EventBus) {
    super(app, eventBus, GameScene.DEAL_CARDS);
    this.container = new Container();
    this.infoText = this.createInfoText();
  }

  async init(): Promise<void> {
    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;

    this.infoText.anchor.set(0.5);
    this.container.addChild(this.infoText);

    this.addChild(this.container);

    window.addEventListener('resize', this.handleResize);
  }

  enter(_data?: unknown): void {
    this.visible = true;
    this.dealCards();
  }

  private async dealCards(): Promise<void> {
    // TODO: Implement card dealing animation
    // - Sequential card dealing animation
    // - Sound effects
    // - Card flip animations
    // - Display player hands

    this.infoText.text = 'Dealing cards...';

    // Simulate dealing animation
    setTimeout(() => {
      this.infoText.text = 'Cards dealt!';

      // Notify State Machine that deal animation is complete
      this.eventBus.emit({ type: GAME_EVENT_IDS.DEAL_ANIM_COMPLETE });
    }, 2000);
  }

  exit(): void {
    this.visible = false;
  }

  update(_delta: number): void {
    // Card animations, hover effects
  }

  private handleResize = (): void => {
    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;
  };

  private createInfoText(): Text {
    return new Text({
      text: 'Dealing cards...',
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
