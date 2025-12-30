/**
 * UI Manager - main entry point for the UI system.
 * Provides API methods for State Machine to control scenes.
 * Scenes emit events via EventBus to notify State Machine of completion.
 */

import { type Application } from 'pixi.js';
import { GameScene } from './types.js';
import { EventBus } from './EventBus.js';
import { SceneManager } from './SceneManager.js';

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

  /**
   * Get the event bus for State Machine to listen for scene completion events.
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Get the current scene type.
   */
  getCurrentScene(): GameScene | null {
    return this.sceneManager.getCurrentScene();
  }

  // ==========================================================================
  // Public API methods for State Machine to call
  // ==========================================================================

  /**
   * Show the loading screen.
   * Scene emits: ASSET_LOADED
   */
  showLoadingScreen(): void {
    this.sceneManager.transitionTo(GameScene.LOADING);
  }

  /**
   * Show the start menu.
   * Scene emits: START_CLICKED
   */
  showStartMenu(): void {
    this.sceneManager.transitionTo(GameScene.START_MENU);
  }

  /**
   * Start the dealer selection animation.
   * @param data - Player information for dealer selection
   * Scene emits: DEALER_ANIM_COMPLETE (with elected dealer)
   */
  startDealerSelection(data: { players: unknown[] }): void {
    this.sceneManager.transitionTo(GameScene.DEALER_SELECTION, data);
  }

  /**
   * Animate dealing cards to players.
   * @param data - Deal state information (hands, talon, trump, etc.)
   * Scene emits: DEAL_ANIM_COMPLETE
   */
  dealCards(data: unknown): void {
    this.sceneManager.transitionTo(GameScene.DEAL_CARDS, data);
  }

  /**
   * Show the deal result (winner, points awarded).
   * @param data - Result information (winner, points, etc.)
   * Scene emits: CONTINUE_CLICKED
   */
  showDealResult(data: { winnerName: string; points: number }): void {
    this.sceneManager.transitionTo(GameScene.DEAL_RESULT, data);
  }

  /**
   * Show the game finished screen with final scores.
   * @param data - Final game data (winner, scores, statistics)
   * Scene emits: PLAY_AGAIN_CLICKED
   */
  showGameFinished(data: { winnerName: string; scores: string }): void {
    this.sceneManager.transitionTo(GameScene.GAME_FINISHED, data);
  }

  destroy(): void {
    this.app.ticker.remove(this.update.bind(this));
    this.sceneManager.destroy();
    this.eventBus.clear();
  }
}
