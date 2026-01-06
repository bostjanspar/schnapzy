import { StateMachine } from '../sm/state-machine.js';
import type { Game } from '../gamelogic/game.js';
import type { UIManager } from '../ui/ui-manager.js';
import { LoadingState } from './load/loading-state.js';
import { StartMenuState } from './start-menu/start-menu-state.js';
import { GameFinishedState } from './game/sub/game-finished-state.js';
import { GameState } from './game/game-state.js';
import { DealCardsState } from './game/sub/deal-cards-state.js';
import { HandResultState } from './game/sub/hand-result-state.js';
import { PlayHandState } from './game/sub/play-hand-state.js';


export function createGameStateMachine(
  game: Game,
  ui: UIManager
): StateMachine {
  const sm = new StateMachine();

  // Create all game states
  const loadingState = new LoadingState(game, ui);
  const startMenuState = new StartMenuState(game, ui);
  const gameState = new GameState(game, ui);

  //add sun-states , not order is important
  new DealCardsState(gameState);
  new PlayHandState(gameState);
  new HandResultState(gameState);
  new GameFinishedState(gameState);


  // Add states to the state machine (order matters - first state is initial)
  sm.addState(loadingState);
  sm.addState(startMenuState);
  sm.addState(gameState);
  return sm;
}
