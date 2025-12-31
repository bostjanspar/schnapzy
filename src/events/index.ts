/**
 * Events module - centralized event definitions for the Schnapsen game.
 *
 * This module provides:
 * - GAME_EVENT_IDS: Constants for event type strings
 * - GameEventId: Type union of all event IDs
 * - Typed event interfaces for events with structured data
 *
 * Usage in UI Scenes:
 *   import { GAME_EVENT_IDS } from '../Events/index.js';
 *   this.eventBus.emit(GAME_EVENT_IDS.START_CLICKED, { language: 'en' });
 *
 * Usage in Game States:
 *   import { GAME_EVENT_IDS } from '../../Events/index.js';
 *   if (this.isEvent(simpleEvent, GAME_EVENT_IDS.START_CLICKED)) { ... }
 */

export { GAME_EVENT_IDS, type GameEventId } from './game-event-ids.js';
export type { GameEvent, StartClickedEvent, DealerAnimCompleteEvent } from './game-event-types.js';
