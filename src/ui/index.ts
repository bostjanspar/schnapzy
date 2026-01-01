/**
 * UI Scene Management System
 *
 * Provides a scene-based architecture for the Schnapsen card game UI.
 * The State Machine controls scenes via UIManager methods;
 * scenes emit events via EventBus which forwards them to the State Machine.
 *
 * @example
 * ```typescript
 * import { UIManager } from './ui';
 * import { GAME_EVENT_IDS } from '../Events/index.js';
 *
 * const uiManager = new UIManager(app);
 * await uiManager.initialize();
 *
 * // State Machine triggers scene
 * uiManager.showStartMenu();
 *
 * // Scenes emit events that flow to State Machine
 * // eventBus.emit(GAME_EVENT_IDS.START_CLICKED, { language: 'en' });
 * ```
 */

// Types and enums
export { GameScene } from './types.js';
export type { SceneTransition } from './types.js';

// Core classes
export { EventBus } from './event-bus.js';
export { BaseScene } from './base-scene.js';
export { SceneManager } from './scene-manager.js';

// Asset management
export { CardAssets, getCardAssets } from './card-assets.js';

// Scene implementations
export { LoadingScene } from './loading-scene.js';
export { StartMenuScene } from './start-menu-scene.js';
export { DealerSelectionScene } from './dealer-selection-scene.js';
export { DealCardsScene } from './deal-cards-scene.js';
export { DealResultScene } from './deal-result-scene.js';
export { GameFinishedScene } from './game-finished-scene.js';

// Main entry point
export { UIManager } from './ui-manager.js';
