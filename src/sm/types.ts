export class SimpleEvent<TType extends string | number = string> {
  type: TType;

  constructor(type: TType) {
    this.type = type;
  }
}

export interface StateMachineOptions {
  debug?: boolean;
  enableEventLogging?: boolean;
}

export class StateMachineError extends Error {
  public stateId: string | number | undefined;

  constructor(
    message: string,
    stateId?: string | number
  ) {
    super(message);
    this.name = 'StateMachineError';
    this.stateId = stateId;
  }
}

export class StateNotFoundError extends StateMachineError {
  constructor(
    targetStateId: string | number,
    fromStateId: string | number
  ) {
    super(
      `Cannot transition from ${String(fromStateId)} to ${String(targetStateId)}: target not found in hierarchy`,
      targetStateId
    );
    this.name = 'StateNotFoundError';
  }
}
