/**
 * Scene manager - manages scene lifecycle and transitions.
 * Called by UIManager to switch between scenes.
 */

import type { Application } from 'pixi.js';
import { GameScene } from './types.js';
import { EventBus } from './EventBus.js';
import { BaseScene } from './BaseScene.js';
import { LoadingScene } from './LoadingScene.js';
import { StartMenuScene } from './StartMenuScene.js';
import { DealerSelectionScene } from './DealerSelectionScene.js';
import { DealCardsScene } from './DealCardsScene.js';
import { DealResultScene } from './DealResultScene.js';
import { GameFinishedScene } from './GameFinishedScene.js';

export class SceneManager {
  private app: Application;
  private eventBus: EventBus;
  private scenes: Map<GameScene, BaseScene> = new Map();
  private currentScene: BaseScene | null = null;
  private transitionInProgress: boolean = false;

  constructor(app: Application, eventBus: EventBus) {
    this.app = app;
    this.eventBus = eventBus;
  }

  async initialize(): Promise<void> {
    // Create all scenes
    this.scenes.set(GameScene.LOADING, new LoadingScene(this.app, this.eventBus));
    this.scenes.set(GameScene.START_MENU, new StartMenuScene(this.app, this.eventBus));
    this.scenes.set(
      GameScene.DEALER_SELECTION,
      new DealerSelectionScene(this.app, this.eventBus),
    );
    this.scenes.set(GameScene.DEAL_CARDS, new DealCardsScene(this.app, this.eventBus));
    this.scenes.set(GameScene.DEAL_RESULT, new DealResultScene(this.app, this.eventBus));
    this.scenes.set(
      GameScene.GAME_FINISHED,
      new GameFinishedScene(this.app, this.eventBus),
    );

    // Initialize all scenes
    const initPromises = Array.from(this.scenes.values()).map(scene => scene.init());
    await Promise.all(initPromises);

    // Add all scenes to stage (hidden initially)
    this.scenes.forEach(scene => {
      scene.visible = false;
      this.app.stage.addChild(scene);
    });
  }

  async transitionTo(sceneType: GameScene, data?: unknown): Promise<void> {
    if (this.transitionInProgress) {
      console.warn('Transition already in progress');
      return;
    }

    const nextScene = this.scenes.get(sceneType);
    if (!nextScene) {
      console.error(`Scene ${sceneType} not found`);
      return;
    }

    this.transitionInProgress = true;

    // Exit current scene
    if (this.currentScene) {
      this.currentScene.exit();
    }

    // Enter new scene
    this.currentScene = nextScene;
    this.currentScene.enter(data);

    this.transitionInProgress = false;
  }

  update(delta: number): void {
    if (this.currentScene) {
      this.currentScene.update(delta);
    }
  }

  getCurrentScene(): GameScene | null {
    return this.currentScene?.sceneType ?? null;
  }

  destroy(): void {
    this.scenes.forEach(scene => scene.destroy());
    this.scenes.clear();
    this.currentScene = null;
  }
}
