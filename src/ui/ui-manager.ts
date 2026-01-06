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

  async initialize(): Promise<void> {
    await this.sceneManager.initialize();

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
    this.sceneManager.transitionTo(GameScene.LOADING);
  }

  showStartMenu(): void {
    this.sceneManager.transitionTo(GameScene.START_MENU);
  }

  startDealerSelection(data: { players: unknown[] }): void {
    this.sceneManager.transitionTo(GameScene.DEALER_SELECTION, data);
  }

  showDealAnimation(gameStateReader: IGameStateReader): void {
    this.sceneManager.transitionTo(GameScene.DEAL_ANIMATION, { gameStateReader });
  }

  startGameplay(
    gameStateReader: IGameStateReader,
    onCardPlayed: (card: Card) => void,
  ): void {
    this.sceneManager.transitionTo(GameScene.GAMEPLAY, {
      gameStateReader,
      onCardPlayed,
    });
  }

  refreshGameplay(): void {
    const scene = this.sceneManager.getScene(GameScene.GAMEPLAY);
    if (scene && 'refreshFromState' in scene) {
      (scene as any).refreshFromState();
    }
  }

  showDealResult(data: { winnerName: string; points: number }): void {
    this.sceneManager.transitionTo(GameScene.DEAL_RESULT, data);
  }

  showGameFinished(data: { winnerName: string; scores: string }): void {
    this.sceneManager.transitionTo(GameScene.GAME_FINISHED, data);
  }

  destroy(): void {
    this.app.ticker.remove(this.update.bind(this));
    this.sceneManager.destroy();
  }
}
