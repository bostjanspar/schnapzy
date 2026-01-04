import { BaseState } from './base-state.js';
import { ROOT } from './state.enum.js';
import type { SimpleEvent } from './types.js';

export class RootState extends BaseState {
  constructor() {
    super(ROOT);
  }

  onEntry(): void {
    // Root state has no entry behavior
  }

  onLeave(): void {
    // Root state has no exit behavior
  }

  public start(): void {
    if (this.children.length === 0) {
      throw new Error('Root state must have at least one child state before starting.');
    }
    const startState = this.children.at(0);
    if (!startState) {
      throw new Error('First child state not found.');
    }
    this.activeSubstate = startState;
    startState.onEntry();
  }

  public override onEvent(simpleEvent: SimpleEvent): boolean {
    // Find the leaf state (deepest active substate)
    let leafState: BaseState | null = this;
    while (leafState) {
      const activeChild = leafState.getActiveSubstate();
      if (!activeChild) break;
      leafState = activeChild;
    }

    // Hierarchical event handling from leaf to root
    let currentState: BaseState | null = leafState;
    while (currentState) {
      if (currentState.onEvent(simpleEvent)) {
        return true; // Event consumed
      }
      currentState = currentState.parent;
    }

    return false; // Event not handled
  }
}

export class StateMachine {
  public priority: number;
  private rootState: RootState = new RootState();

  constructor(priority: number = 0) {
    this.priority = priority;
  }

  public addState(state: BaseState): void {
    this.rootState.addSubState(state);
  }

  public start(): void {
    this.rootState.start();
  }

  public onEvent(simpleEvent: SimpleEvent): boolean {
    return this.rootState.onEvent(simpleEvent);
  }

  public getRoot(): RootState {
    return this.rootState;
  }
}
