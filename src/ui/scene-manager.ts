import type { Application } from 'pixi.js';
import log from 'loglevel';
import { GameScene } from './types.js';
import { EventBus } from './event-bus.js';
import { BaseScene } from './base-scene.js';
import { LoadingScene } from './loading-scene.js';
import { StartMenuScene } from './start-menu-scene.js';
import { DealerSelectionScene } from './dealer-selection-scene.js';
import { DealAnimationScene } from './deal-animation-scene.js';
import { GameplayScene } from './gameplay-scene.js';
import { DealResultScene } from './deal-result-scene.js';
import { GameFinishedScene } from './game-finished-scene.js';

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

  initialize(): void {
    // Create all scenes
    this.scenes.set(GameScene.LOADING, new LoadingScene(this.app, this.eventBus));
    this.scenes.set(GameScene.START_MENU, new StartMenuScene(this.app, this.eventBus));
    this.scenes.set(
      GameScene.DEALER_SELECTION,
      new DealerSelectionScene(this.app, this.eventBus),
    );
    this.scenes.set(GameScene.DEAL_ANIMATION, new DealAnimationScene(this.app, this.eventBus));
    this.scenes.set(GameScene.GAMEPLAY, new GameplayScene(this.app, this.eventBus));
    this.scenes.set(GameScene.DEAL_RESULT, new DealResultScene(this.app, this.eventBus));
    this.scenes.set(
      GameScene.GAME_FINISHED,
      new GameFinishedScene(this.app, this.eventBus),
    );

    // Initialize all scenes
    this.scenes.forEach(scene => scene.init());

    // Add all scenes to stage (hidden initially)
    this.scenes.forEach(scene => {
      scene.visible = false;
      this.app.stage.addChild(scene);
    });
  }

  getScene(sceneType: GameScene): BaseScene | undefined {
    return this.scenes.get(sceneType);
  }

  transitionTo(sceneType: GameScene): void {
    if (this.transitionInProgress) {
      log.warn('Transition already in progress. Transition request to ' + sceneType + 'ignored. Current scene: ' + (this.currentScene ? this.currentScene.sceneType : 'none'));
      return;
    }

    const nextScene = this.scenes.get(sceneType);
    if (!nextScene) {
      log.error(`Scene ${sceneType} not found`);
      return;
    }

    this.transitionInProgress = true;

    // Exit current scene
    if (this.currentScene) {
      this.currentScene.exit();
    }

    // Enter new scene
    this.currentScene = nextScene;
    this.currentScene.enter();

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
