import { type Application } from 'pixi.js';
import { GameScene } from './types.js';
import { EventBus } from './event-bus.js';
import { SceneManager } from './scene-manager.js';

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

  dealCards(data: unknown): void {
    this.sceneManager.transitionTo(GameScene.DEAL_CARDS, data);
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
