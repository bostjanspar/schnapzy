/**
 * Typed event classes extending the base SimpleEvent.
 * Provides type safety for events that carry structured data.
 */

import { SimpleEvent } from '../sm/types.js';
import { GAME_EVENT_IDS } from './game-event-ids.js';


export class EventAssetLoaded extends SimpleEvent<typeof GAME_EVENT_IDS.ASSET_LOADED> {
  constructor() {
    super(GAME_EVENT_IDS.ASSET_LOADED);
  }
}

export class EventStartGame extends SimpleEvent<typeof GAME_EVENT_IDS.START_CLICKED> {
  constructor() {
    super(GAME_EVENT_IDS.START_CLICKED);
  }
}