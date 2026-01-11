import { Container, type Application } from 'pixi.js';
import type { EventBus } from './event-bus.js';
import { GameScene } from './types.js';
import type { IGameStateReader } from './game-state-reader.js';

export abstract class BaseScene extends Container {
  protected app: Application;
  protected eventBus: EventBus;
  protected gameStateReader: IGameStateReader;
  readonly sceneType: GameScene;

  constructor(app: Application, eventBus: EventBus, gameStateReader: IGameStateReader, sceneType: GameScene) {
    super();
    this.app = app;    
    this.eventBus = eventBus;
    this.gameStateReader = gameStateReader;
    this.sceneType = sceneType;
  }

  abstract init(): void;

  abstract enter(): void;

  abstract exit(): void;

  abstract update(delta: number): void;

  override destroy(): void {
    this.removeAllListeners();
    this.removeChildren();
    super.destroy({ children: true });
  }
}
