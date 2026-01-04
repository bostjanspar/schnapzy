export const ROOT = 0;

export const INITIAL = 1;

// Test states (for unit testing the state machine library)
export const UNIT_TEST_STATE_A = 100;
export const UNIT_TEST_STATE_B = 101;
export const UNIT_TEST_STATE_C = 102;
export const UNIT_TEST_PARENT = 200;
export const UNIT_TEST_CHILD_A = 201;
export const UNIT_TEST_CHILD_B = 202;
export const UNIT_TEST_GRANDCHILD = 300;

export type StateEnum =
  | typeof ROOT
  | typeof INITIAL
  | typeof UNIT_TEST_STATE_A
  | typeof UNIT_TEST_STATE_B
  | typeof UNIT_TEST_STATE_C
  | typeof UNIT_TEST_PARENT
  | typeof UNIT_TEST_CHILD_A
  | typeof UNIT_TEST_CHILD_B
  | typeof UNIT_TEST_GRANDCHILD;
