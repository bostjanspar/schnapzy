/**
 * Factory function to create and configure the game state machine.
 *
 * The game state machine bridges the UI layer (scenes) and the game logic layer.
 * It listens to events from scenes via EventBus and controls scene transitions via UIManager.
 */

import { StateMachine } from '../sm/state-machine.js';
import type { SchnapsenGame } from '../gamelogic/SchnapsenGame.js';
import type { UIManager } from '../ui/UIManager.js';
import type { EventBus } from '../ui/EventBus.js';
import { LoadingState } from './LoadingState.js';
import { StartMenuState } from './StartMenuState.js';
import { DealerSelectionState } from './DealerSelectionState.js';
import { DealCardsState } from './DealCardsState.js';
import { DealResultState } from './DealResultState.js';
import { GameFinishedState } from './GameFinishedState.js';

/**
 * Creates a configured game state machine for the Schnapsen game.
 *
 * @param game - The Schnapsen game logic instance
 * @param ui - The UI manager for controlling scenes
 * @param eventBus - The event bus for receiving UI events
 * @returns A configured StateMachine ready to start
 */
export function createGameStateMachine(
  game: SchnapsenGame,
  ui: UIManager,
  eventBus: EventBus
): StateMachine {
  const sm = new StateMachine();

  // Create all game states
  const loadingState = new LoadingState(game, ui, eventBus);
  const startMenuState = new StartMenuState(game, ui, eventBus);
  const dealerSelectionState = new DealerSelectionState(game, ui, eventBus);
  const dealCardsState = new DealCardsState(game, ui, eventBus);
  const dealResultState = new DealResultState(game, ui, eventBus);
  const gameFinishedState = new GameFinishedState(game, ui, eventBus);

  // Add states to the state machine (order matters - first state is initial)
  sm.addState(loadingState);
  sm.addState(startMenuState);
  sm.addState(dealerSelectionState);
  sm.addState(dealCardsState);
  sm.addState(dealResultState);
  sm.addState(gameFinishedState);

  return sm;
}
