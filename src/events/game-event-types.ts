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


export class EventDealAnimationComplete extends SimpleEvent<typeof GAME_EVENT_IDS.DEAL_ANIM_COMPLETE> {
  constructor() {
    super(GAME_EVENT_IDS.DEAL_ANIM_COMPLETE);
  }
}


export class EventGamePlayReady extends SimpleEvent<typeof GAME_EVENT_IDS.GAME_PLAY_READY> {
  constructor() {
    super(GAME_EVENT_IDS.GAME_PLAY_READY);
  }
}