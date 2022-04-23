export enum TestCase {
  arrowFunction = "arrow-function",
  classicFunction = "classic-function",
}
export const testCases = Object.values(TestCase);
export enum TestCommon {
  noFunction = "no-function",
}
export const testCommon = Object.values(TestCommon);
export enum TestResult {
  error = "error",
  success = "success",
}
export const testResult = Object.values(TestResult);
export enum TestType {
  callbackEnding = "callbackEnding",
  sync = "sync",
  promise = "promise",
}
export const testType = Object.values(TestType);
