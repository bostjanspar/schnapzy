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

  abstract init(): Promise<void>;

  abstract enter(data?: unknown): void;

  abstract exit(): void;

  abstract update(delta: number): void;

  override destroy(): void {
    this.removeAllListeners();
    this.removeChildren();
    super.destroy({ children: true });
  }
}
