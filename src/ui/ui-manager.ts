import { type Application } from 'pixi.js';
import { GameScene } from './types.js';
import { EventBus } from './event-bus.js';
import { SceneManager } from './scene-manager.js';
import type { IGameStateReader } from './game-state-reader.js';
import type { Card } from '../gamelogic/types.js';

export class UIManager {
  private app: Application;
  private eventBus: EventBus;
  private sceneManager: SceneManager;

  constructor(app: Application) {
    this.app = app;
    this.eventBus = new EventBus();
    this.sceneManager = new SceneManager(this.app, this.eventBus);
  }

  initialize(): void {
    this.sceneManager.initialize();

    // Setup game loop
    this.app.ticker.add(this.update.bind(this));
  }

  private update(ticker: { deltaTime: number }): void {
    const delta = ticker.deltaTime;
    this.sceneManager.update(delta);
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getCurrentScene(): GameScene | null {
    return this.sceneManager.getCurrentScene();
  }

  // ==========================================================================
  // Public API methods for State Machine to call
  // ==========================================================================

  showLoadingScreen(): void {
    this.sceneManager.showLoadingScreen();
  }

  showStartMenu(): void {
    this.sceneManager.transitionTo(GameScene.START_MENU);
  }

  startDealerSelection(data: { players: unknown[] }): void {
    const scene = this.sceneManager.getScene(GameScene.DEALER_SELECTION);
    if (scene && 'setPlayers' in scene) {
      (scene as any).setPlayers(data.players);
    }
    this.sceneManager.transitionTo(GameScene.DEALER_SELECTION);
  }

  showDealAnimation(gameStateReader: IGameStateReader): void {
    const scene = this.sceneManager.getScene(GameScene.DEAL_ANIMATION);
    if (scene && 'prepare' in scene) {
      (scene as any).prepare(gameStateReader);
    }
    this.sceneManager.transitionTo(GameScene.DEAL_ANIMATION);
  }

  startGameplay(
    gameStateReader: IGameStateReader,
    onCardPlayed: (card: Card) => void,
  ): void {
    const scene = this.sceneManager.getScene(GameScene.GAMEPLAY);
    if (scene && 'prepare' in scene) {
      (scene as any).prepare({ gameStateReader, onCardPlayed });
    }
    this.sceneManager.transitionTo(GameScene.GAMEPLAY);
  }

  refreshGameplay(): void {
    const scene = this.sceneManager.getScene(GameScene.GAMEPLAY);
    if (scene && 'refreshFromState' in scene) {
      (scene as any).refreshFromState();
    }
  }

  showDealResult(data: { winnerName: string; points: number }): void {
    const scene = this.sceneManager.getScene(GameScene.DEAL_RESULT);
    if (scene && 'setResult' in scene) {
      (scene as any).setResult(data.winnerName, data.points);
    }
    this.sceneManager.transitionTo(GameScene.DEAL_RESULT);
  }

  showGameFinished(data: { winnerName: string; scores: string }): void {
    const scene = this.sceneManager.getScene(GameScene.GAME_FINISHED);
    if (scene && 'setResult' in scene) {
      (scene as any).setResult(data.winnerName, data.scores);
    }
    this.sceneManager.transitionTo(GameScene.GAME_FINISHED);
  }

  destroy(): void {
    this.app.ticker.remove(this.update.bind(this));
    this.sceneManager.destroy();
  }
}
