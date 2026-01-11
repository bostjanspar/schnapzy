import './style.css';
import { Application } from 'pixi.js';
import { Game } from './gamelogic/index.js';
import { GameStateReader, UIManager } from './ui/index.js';
import { createGameStateMachine } from './game_sm/index.js';
import log from 'loglevel'

const app = new Application();

log.setLevel('debug')

async function init(): Promise<void> {
  await app.init({
    background: '#1a1a2e',
    resizeTo: window,
    antialias: true,
  });

  document.querySelector<HTMLDivElement>('#app')!.appendChild(app.canvas);


  // Initialize the game logic
  const game = new Game();

  // Initialize the UI manager
  const uiManager = new UIManager(app, new GameStateReader(game));
  uiManager.initialize();

  // Create and configure the game state machine
  const gameStateMachine = createGameStateMachine(game, uiManager);

  // Connect EventBus to StateMachine
  // All UI events flow directly to the state machine
  uiManager.getEventBus().setStateMachine(gameStateMachine);

  // Start the state machine (will enter LOADING state)
  gameStateMachine.start();
}

void init();
