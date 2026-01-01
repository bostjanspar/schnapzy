/**
 * Game finished scene - displays the final game winner and statistics.
 * Emits PLAY_AGAIN_CLICKED when user clicks play again.
 */

import { Text, Container, type Application } from 'pixi.js';
import { BaseScene } from './base-scene.js';
import { EventBus } from './event-bus.js';
import { GameScene } from './types.js';

export class GameFinishedScene extends BaseScene {
  private container: Container;
  private winnerText: Text;
  private scoresText: Text;
  private playAgainText: Text;

  constructor(app: Application, eventBus: EventBus) {
    super(app, eventBus, GameScene.GAME_FINISHED);
    this.container = new Container();
    this.winnerText = this.createWinnerText();
    this.scoresText = this.createScoresText();
    this.playAgainText = this.createPlayAgainText();
  }

  async init(): Promise<void> {
    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;

    this.winnerText.anchor.set(0.5);
    this.winnerText.y = -100;
    this.container.addChild(this.winnerText);

    this.scoresText.anchor.set(0.5);
    this.scoresText.y = 0;
    this.container.addChild(this.scoresText);

    this.playAgainText.anchor.set(0.5);
    this.playAgainText.y = 100;
    this.playAgainText.eventMode = 'static';
    this.playAgainText.cursor = 'pointer';
    this.playAgainText.on('pointerdown', this.onPlayAgainClicked);
    this.container.addChild(this.playAgainText);

    this.addChild(this.container);

    window.addEventListener('resize', this.handleResize);
  }

  enter(data?: unknown): void {
    this.visible = true;
    this.showGameWinner(data);
  }

  private showGameWinner(data?: unknown): void {
    // TODO: Display game over screen
    // - Game winner
    // - Final scores
    // - Victory animation
    // - Statistics

    const winnerName = (data as { winnerName?: string })?.winnerName ?? 'Player 1';
    const scores = (data as { scores?: string })?.scores ?? 'P1: 0 | P2: 0';

    this.winnerText.text = `${winnerName} WINS THE GAME!`;
    this.scoresText.text = `Final Scores: ${scores}`;
  }

  private onPlayAgainClicked = (): void => {
    // Notify State Machine to restart game
    //this.eventBus.emit(GAME_EVENT_IDS.PLAY_AGAIN_CLICKED);
  };

  exit(): void {
    this.visible = false;
  }

  update(_delta: number): void {
    // Victory animations
  }

  private handleResize = (): void => {
    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;
  };

  private createWinnerText(): Text {
    return new Text({
      text: 'GAME OVER',
      style: {
        fontFamily: 'Arial',
        fontSize: 48,
        fontWeight: 'bold',
        fill: 0xffd700,
        align: 'center',
      },
    });
  }

  private createScoresText(): Text {
    return new Text({
      text: 'Final Scores',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        align: 'center',
      },
    });
  }

  private createPlayAgainText(): Text {
    return new Text({
      text: 'PLAY AGAIN',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0x00ff00,
        align: 'center',
      },
    });
  }

  override destroy(): void {
    this.playAgainText.off('pointerdown', this.onPlayAgainClicked);
    window.removeEventListener('resize', this.handleResize);
    super.destroy();
  }
}
