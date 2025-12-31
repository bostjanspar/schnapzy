/**
 * Abstract base class for all game scenes.
 * Provides lifecycle methods and common scene functionality.
 */

import { Container, type Application } from 'pixi.js';
import type { EventBus } from './event-bus.js';
import { GameScene } from './types.js';

export abstract class BaseScene extends Container {
  protected app: Application;
  protected eventBus: EventBus;
  readonly sceneType: GameScene;

  constructor(app: Application, eventBus: EventBus, sceneType: GameScene) {
    super();
    this.app = app;
    this.eventBus = eventBus;
    this.sceneType = sceneType;
  }

  /**
   * Initialize the scene (called once during setup).
   * Load assets, create sprites, set up initial state.
   */
  abstract init(): Promise<void>;

  /**
   * Called when the scene becomes active.
   * @param data - Optional data passed from previous scene or State Machine.
   */
  abstract enter(data?: unknown): void;

  /**
   * Called when the scene is deactivated.
   * Clean up temporary state, but keep reusable assets.
   */
  abstract exit(): void;

  /**
   Called every frame by the game loop.
   * @param delta - Time elapsed since last frame (in seconds).
   */
  abstract update(delta: number): void;

  /**
   * Clean up and destroy the scene.
   */
  override destroy(): void {
    this.removeAllListeners();
    this.removeChildren();
    super.destroy({ children: true });
  }
}
