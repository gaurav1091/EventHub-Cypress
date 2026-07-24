export const selectorAttributes = {
  testId: "data-cy",
};

export function byTestId(testId) {
  return `[${selectorAttributes.testId}="${testId}"]`;
}
