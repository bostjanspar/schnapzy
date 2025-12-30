/**
 * UI Scene Management System
 *
 * Provides a scene-based architecture for the Schnapsen card game UI.
 * The State Machine controls scenes via UIManager methods;
 * scenes emit events via EventBus to notify completion.
 *
 * @example
 * ```typescript
 * import { UIManager, GameEvent } from './ui';
 *
 * const uiManager = new UIManager(app);
 * await uiManager.initialize();
 *
 * // State Machine triggers scene
 * uiManager.showStartMenu();
 *
 * // State Machine listens for completion
 * uiManager.getEventBus().on(GameEvent.START_CLICKED, () => {
 *   uiManager.startDealerSelection(players);
 * });
 * ```
 */

// Types and enums
export { GameScene, GameEvent } from './types.js';
export type { SceneTransition, EventCallback } from './types.js';

// Core classes
export { EventBus } from './EventBus.js';
export { BaseScene } from './BaseScene.js';
export { SceneManager } from './SceneManager.js';

// Scene implementations
export { LoadingScene } from './LoadingScene.js';
export { StartMenuScene } from './StartMenuScene.js';
export { DealerSelectionScene } from './DealerSelectionScene.js';
export { DealCardsScene } from './DealCardsScene.js';
export { DealResultScene } from './DealResultScene.js';
export { GameFinishedScene } from './GameFinishedScene.js';

// Main entry point
export { UIManager } from './UIManager.js';
