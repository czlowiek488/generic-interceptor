import { TestCaseDescribe, TestCommonDescribe, TestCommonIt, TestResult, TestCaseIt, Prefix } from "./enum";
type ExportJestGlobal<T> = { [key in keyof T]: T[key] };
interface CaseDescribe extends ExportJestGlobal<typeof describe> {
  (name: `<${TestCaseDescribe}>`, fn: Function): void;
}
interface CaseIt extends ExportJestGlobal<typeof it> {
  (name: `<${TestCaseIt}> <${TestResult}>`, fn?: Function, timeout?: number): void;
}
export const caseDescribe = describe as CaseDescribe;
export const caseIt = it as CaseIt;
interface CommonDescribe extends ExportJestGlobal<typeof describe> {
  (name: `<${Prefix.commonPrefix}> <${TestCommonDescribe}>`, fn?: Function): void;
}
interface CommonIt extends ExportJestGlobal<typeof it> {
  (name: `<${Prefix.commonPrefix}> <${TestCommonIt}>`, fn?: Function, timeout?: number): void;
}
export const commonDescribe = describe as CommonDescribe;
export const commonIt = it as CommonIt;
