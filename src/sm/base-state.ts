import type { StateEnum } from './state.enum.js';
import type { SimpleEvent } from './types.js';

export abstract class BaseState {
  public parent: BaseState | null = null;
  protected children: BaseState[] = [];
  protected activeSubstate: BaseState | null = null;
  protected debug: boolean = false;
  public id: StateEnum;

  constructor(id: StateEnum) {
    this.id = id;
  }

  public addSubState(childState: BaseState): void {
    if (this.children.some(child => child.id === childState.id)) {
      throw new Error(
        `State with ID ${String(childState.id)} already exists as a substate.`
      );
    }

    // Check for circular references
    let current: BaseState | null = this;
    while (current) {
      if (current === childState) {
        throw new Error(
          'Circular reference detected: a state cannot be its own ancestor.'
        );
      }
      current = current.parent;
    }

    childState.parent = this;
    this.children.push(childState);
  }

  protected get defaultSubstateIndex(): number {
    return 0;
  }

  public getActiveSubstate(): BaseState | null {
    return this.activeSubstate;
  }

  public hasActiveSubstate(): boolean {
    return this.activeSubstate !== null;
  }

  public isLeafState(): boolean {
    return this.children.length === 0;
  }

  public abstract onEntry(): void;

  public abstract onLeave(): void;

  public onEvent(_simpleEvent: SimpleEvent): boolean {
    return false;
  }

  public transition(targetStateId: StateEnum): void {
    const self = this;
    queueMicrotask(() => self.executeTransition(targetStateId));
  }

  private executeTransition(targetStateId: StateEnum): void {
    let searchRoot: BaseState | null = this.parent;

    // Search up the hierarchy for states containing the target
    while (searchRoot) {
      const found = searchRoot.findTransition(targetStateId);
      if (found) {
        searchRoot.internalTransition(found);
        return;
      }
      searchRoot = searchRoot.parent;
    }

    throw new Error(
      `State with ID ${String(
        targetStateId
      )} does not exist in hierarchy from state ${String(this.id)}.`
    );
  }

  protected findTransition(targetStateId: StateEnum): BaseState | null {
    return this.children.find(child => child.id === targetStateId) ?? null;
  }

  protected internalTransition(transToState: BaseState): void {
    // Exit all active substates (deepest first)
    let activeState = this.activeSubstate;
    while (activeState) {
      activeState.onLeave();
      const next = activeState.activeSubstate;
      activeState.activeSubstate = null;
      activeState = next;
    }

    // Enter the target state
    transToState.onEntry();
    this.activeSubstate = transToState;

    // FIX for Issue 2: Use defaultSubstateIndex instead of hardcoded [0]
    // Activate default substates recursively
    let currentState: BaseState = transToState;
    while (currentState.children.length > 0) {
      const defaultIndex = currentState.defaultSubstateIndex;
      if (defaultIndex < 0 || defaultIndex >= currentState.children.length) {
        throw new Error(
          `Invalid default substate index: ${defaultIndex} for state ${String(
            currentState.id
          )}`
        );
      }

      const childState = currentState.children.at(defaultIndex);
      if (!childState) {
        throw new Error(
          `Child state at index ${defaultIndex} not found for state ${String(
            currentState.id
          )}`
        );
      }
      currentState.activeSubstate = childState;
      childState.onEntry();
      currentState = childState;
    }
  }

   protected safeParentTransition(stateId: StateEnum): void {
    if (this.parent) {
      this.parent.transition(stateId);
    } else {
      throw new Error(`No parent state machine for state ${this.id} to transition to ${stateId}.`);
    }
  }
}
