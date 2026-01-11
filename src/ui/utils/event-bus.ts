import type { StateMachine } from '../../sm/state-machine.js';
import type { SimpleEvent } from '../../sm/types.js';

export class EventBus {
  private stateMachine?: StateMachine;

  setStateMachine(stateMachine: StateMachine): void {
    this.stateMachine = stateMachine;
  }

  emit(simpleEvent: SimpleEvent): void {
    if (!this.stateMachine) {
      console.warn(`EventBus.emit called before state machine was set: ${simpleEvent.type}`);
      return;
    }
    this.stateMachine.onEvent(simpleEvent);
  }
}
