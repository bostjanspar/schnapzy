import { Text, Container, type Application } from 'pixi.js';
import { BaseScene } from './utils/base-scene.js';
import { EventBus } from './utils/event-bus.js';
import { GAME_EVENT_IDS } from '../events/index.js';
import { GameScene } from './utils/types.js';
import type { IGameStateReader } from './utils/game-state-reader.js';

export class DealResultScene extends BaseScene {
  private container: Container;
  private winnerText: Text;
  private continueText: Text;

  private winnerName: string = '';
  private points: number = 0;

  constructor(app: Application, eventBus: EventBus, gameStateReader: IGameStateReader) {
    super(app, eventBus, gameStateReader, GameScene.DEAL_RESULT);
    this.container = new Container();
    this.winnerText = this.createWinnerText();
    this.continueText = this.createContinueText();
  }

  init(): void {
    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;

    this.winnerText.anchor.set(0.5);
    this.winnerText.y = -50;
    this.container.addChild(this.winnerText);

    this.continueText.anchor.set(0.5);
    this.continueText.y = 50;
    this.continueText.eventMode = 'static';
    this.continueText.cursor = 'pointer';
    this.continueText.on('pointerdown', this.onContinueClicked);
    this.container.addChild(this.continueText);

    this.addChild(this.container);

    window.addEventListener('resize', this.handleResize);
  }

  setResult(winnerName: string, points: number): void {
    this.winnerName = winnerName;
    this.points = points;
  }

  enter(): void {
    this.visible = true;
    this.showDealWinner();
  }

  private showDealWinner(): void {
    // TODO: Display deal result
    // - Winning player highlight
    // - Points awarded
    // - Animation effects

    this.winnerText.text = `${this.winnerName} wins the deal!\nPoints: ${this.points}`;
  }

  private onContinueClicked = (): void => {
    // Notify State Machine to proceed
    this.eventBus.emit({ type: GAME_EVENT_IDS.CONTINUE_CLICKED });
  };

  exit(): void {
    this.visible = false;
  }

  update(_delta: number): void {
    // Result animations
  }

  private handleResize = (): void => {
    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;
  };

  private createWinnerText(): Text {
    return new Text({
      text: 'Player wins!',
      style: {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0xffffff,
        align: 'center',
      },
    });
  }

  private createContinueText(): Text {
    return new Text({
      text: 'CONTINUE',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0x00ff00,
        align: 'center',
      },
    });
  }

  override destroy(): void {
    this.continueText.off('pointerdown', this.onContinueClicked);
    window.removeEventListener('resize', this.handleResize);
    super.destroy();
  }
}
