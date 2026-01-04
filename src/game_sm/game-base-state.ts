
import { BaseState } from '../sm/base-state.js';
import type { StateEnum } from '../sm/state.enum.js';
import type { SimpleEvent } from '../sm/types.js';
import type { SchnapsenGame } from '../gamelogic/schnapsen-game.js';
import type { UIManager } from '../ui/ui-manager.js';

export abstract class GameBaseState extends BaseState {
  public readonly game: SchnapsenGame;
  public readonly ui: UIManager;

  constructor(
    id: StateEnum,
    game: SchnapsenGame,
    ui: UIManager,

  ) {
    super(id);
    this.game = game;
    this.ui = ui!;
  }

  protected isEvent(simpleEvent: SimpleEvent, eventType: string): boolean {
    return simpleEvent.type === eventType;
  }
}
