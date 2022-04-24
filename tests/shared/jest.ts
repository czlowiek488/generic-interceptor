import { TestCaseDescribe, TestCommonDescribe, TestCommonIt, TestResult, TestStrategyIt, TestPrefix } from "./enum";

type Export<T> = { [key in keyof T]: T[key] };
type Describe = Export<typeof describe>;
type It = Export<typeof it>;
export type JestFunction = Function;
export type StrategyItName = `<${TestStrategyIt}> <${TestResult}>`;
interface CaseDescribe extends Describe {
  (name: `<${TestCaseDescribe}>`, fn: JestFunction): void;
}
interface StrategyIt extends It {
  (name: StrategyItName, fn?: JestFunction, timeout?: number): void;
}
interface CommonDescribe extends Describe {
  (name: `<${TestPrefix.commonPrefix}> <${TestCommonDescribe}>`, fn?: JestFunction): void;
}
interface CommonIt extends It {
  (name: `<${TestPrefix.commonPrefix}> <${TestCommonIt}>`, fn?: JestFunction, timeout?: number): void;
}
export const caseDescribe = describe as CaseDescribe;
export const strategyIt = it as StrategyIt;
export const commonDescribe = describe as CommonDescribe;
export const commonIt = it as CommonIt;
