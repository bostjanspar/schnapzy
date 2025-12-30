import './style.css';
import { Application } from 'pixi.js';
import { SchnapsenGame } from './gamelogic/index.js';
import { UIManager } from './ui/index.js';
import { createGameStateMachine } from './game_sm/index.js';

const app = new Application();

async function init(): Promise<void> {
  await app.init({
    background: '#1a1a2e',
    resizeTo: window,
    antialias: true,
  });

  document.querySelector<HTMLDivElement>('#app')!.appendChild(app.canvas);

  // Initialize the UI manager
  const uiManager = new UIManager(app);
  await uiManager.initialize();

  // Initialize the game logic
  const game = new SchnapsenGame();

  // Create and configure the game state machine
  const gameStateMachine = createGameStateMachine(
    game,
    uiManager,
    uiManager.getEventBus()
  );

  // Connect EventBus to StateMachine
  // All UI events flow through the state machine for processing
  const eventBus = uiManager.getEventBus();
  eventBus.onAny((event, data) => {
    gameStateMachine.onEvent({ type: event, data });
  });

  // Start the state machine (will enter LOADING state)
  gameStateMachine.start();
}

void init();
