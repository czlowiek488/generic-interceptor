import {
  TestCaseDescribe,
  TestCommonDescribe,
  TestCommonIt,
  TestStrategyResult,
  TestStrategyIt,
  TestPrefix,
} from "./enum";

export type Export<T> = { [key in keyof T]: T[key] };
export type Describe = Export<typeof describe>;
export type It = Export<typeof it>;
export type JestFunction = Function;
export type CaseDescribeName = `<${TestCaseDescribe}>`;
export type StrategyItName = `<${TestStrategyIt}> <${TestStrategyResult}>`;
export interface CaseDescribe extends Describe {
  (name: CaseDescribeName, fn: JestFunction): void;
}
export interface StrategyIt extends It {
  (name: StrategyItName, fn?: JestFunction, timeout?: number): void;
}
export interface CommonDescribe extends Describe {
  (name: `<${TestPrefix.commonPrefix}> <${TestCommonDescribe}>`, fn?: JestFunction): void;
}
export interface CommonIt extends It {
  (name: `<${TestPrefix.commonPrefix}> <${TestCommonIt}>`, fn?: JestFunction, timeout?: number): void;
}
export const caseDescribe = describe as CaseDescribe;
export const strategyIt = it as StrategyIt;
export const commonDescribe = describe as CommonDescribe;
export const commonIt = it as CommonIt;
