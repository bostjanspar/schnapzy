
import { BaseState } from '../sm/base-state.js';
import type { StateEnum } from '../sm/state.enum.js';
import type { SimpleEvent } from '../sm/types.js';
import type { Game } from '../gamelogic/game.js';
import { GAME } from './game-state.enum.js';
import type { UIManager } from '../ui/ui-manager.js';
import type { GameState } from './game/game-state.js';

export abstract class GameBaseState extends BaseState {
  public readonly game: Game;
  public readonly ui: UIManager;

  constructor(
    id: StateEnum,
    game: Game,
    ui: UIManager,

  ) {
    super(id);
    this.game = game;
    this.ui = ui!;
  }

  protected isEvent(simpleEvent: SimpleEvent, eventType: string): boolean {
    return simpleEvent.type === eventType;
  }

  getParentCpuPlayer() {
    if (this.parent?.id === GAME) {
      return (this.parent as GameState).getCpuPlayer
    }
    throw new Error(`This ${this.id} parent state  ${this.parent?.id} is not GameState`);
  }
  
}
