import { type Application } from 'pixi.js';
import { GameScene } from './utils/types.js';
import { EventBus } from './utils/event-bus.js';
import { SceneManager } from './scene-manager.js';
import type { IGameStateReader } from './utils/game-state-reader.js';

export class UIManager {
  private app: Application;
  private gameStateReader: IGameStateReader;
  private eventBus: EventBus;
  private sceneManager: SceneManager;

  constructor(app: Application, gameStateReader: IGameStateReader) {
    this.app = app;
    this.gameStateReader = gameStateReader;
    this.eventBus = new EventBus();
    this.sceneManager = new SceneManager(this.app, this.eventBus, this.gameStateReader);
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

  showDealAnimation(): void {    
    this.sceneManager.transitionTo(GameScene.DEAL_ANIMATION);
  }

  startGameplay(): void {    
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
