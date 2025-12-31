/**
 * Base class for all game states in the Schnapsen game state machine.
 * Provides access to game logic, UI manager, and event bus.
 */

import { BaseState } from '../sm/base-state.js';
import type { StateEnum } from '../sm/state.enum.js';
import type { SimpleEvent } from '../sm/types.js';
import type { SchnapsenGame } from '../gamelogic/schnapsen-game.js';
import type { UIManager } from '../ui/ui-manager.js';
import type { EventBus } from '../ui/event-bus.js';

/**
 * Abstract base class for all game states.
 * All game states have access to:
 * - game: The Schnapsen game logic
 * - ui: The UI manager for controlling scenes
 * - eventBus: The event bus for checking event types
 */
export abstract class GameBaseState extends BaseState {
  protected game: SchnapsenGame;
  protected ui: UIManager;
  protected eventBus: EventBus;

  constructor(
    id: StateEnum,
    game: SchnapsenGame,
    ui: UIManager,
    eventBus: EventBus
  ) {
    super(id);
    this.game = game;
    this.ui = ui;
    this.eventBus = eventBus;
  }

  /**
   * Helper method to check if an event matches a specific game event type.
   */
  protected isEvent(simpleEvent: SimpleEvent, eventType: string): boolean {
    return simpleEvent.type === eventType;
  }
}
