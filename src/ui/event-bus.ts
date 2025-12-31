/**
 * Simplified event bus for scene-to-StateMachine communication.
 *
 * Scenes emit events via emit(); events are forwarded directly to the StateMachine.
 * This replaces the previous wildcard listener pattern with direct injection.
 */

import type { StateMachine } from '../sm/state-machine.js';
import type { SimpleEvent } from '../sm/types.js';

export class EventBus {
  private stateMachine?: StateMachine;

  /**
   * Set the state machine to receive events.
   * Called after initialization to avoid circular dependency.
   */
  setStateMachine(stateMachine: StateMachine): void {
    this.stateMachine = stateMachine;
  }

  /**
   * Emit an event directly to the state machine.
   * @param event - Event name/type
   * @param data - Optional event data payload
   */
  emit(event: string, data?: unknown): void {
    if (!this.stateMachine) {
      console.warn(`EventBus.emit called before state machine was set: ${event}`);
      return;
    }
    const simpleEvent: SimpleEvent = { type: event, data };
    this.stateMachine.onEvent(simpleEvent);
  }
}
