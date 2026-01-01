/**
 * Factory function to create and configure the game state machine.
 *
 * The game state machine bridges the UI layer (scenes) and the game logic layer.
 * It listens to events from scenes via EventBus and controls scene transitions via UIManager.
 */

import { StateMachine } from '../sm/state-machine.js';
import type { SchnapsenGame } from '../gamelogic/schnapsen-game.js';
import type { UIManager } from '../ui/ui-manager.js';
import { LoadingState } from './load/loading-state.js';
import { StartMenuState } from './start-menu/start-menu-state.js';
import { GameFinishedState } from './game/sub/game-finished-state.js';
import { GameState } from './game/game-state.js';
import { DealerSelectionState } from './game/sub/dealer-selection-state.js';
import { DealCardsState } from './game/sub/deal-cards-state.js';
import { HandResultState } from './game/sub/hand-result-state.js';


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
  ui: UIManager
): StateMachine {
  const sm = new StateMachine();

  // Create all game states
  const loadingState = new LoadingState(game, ui);
  const startMenuState = new StartMenuState(game, ui);
  const gameState = new GameState(game, ui);

  //add sun-states , not order is important 
  new DealerSelectionState(gameState);  
  new DealCardsState(gameState);
  new HandResultState(gameState);
  new GameFinishedState(gameState);


  // Add states to the state machine (order matters - first state is initial)
  sm.addState(loadingState);
  sm.addState(startMenuState);
  sm.addState(gameState);    
  return sm;
}
