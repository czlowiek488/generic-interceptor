import { TestCase, TestCommon, TestResult, TestType } from "./name";

interface CaseIt extends Omit<typeof it, "name"> {
  (name: `<${TestType}> <${TestResult}>`, fn?: Function, timeout?: number): void;
}

interface CaseDescribe extends Omit<typeof describe, "name"> {
  (name: `<${TestCase}>`, fn: Function): void;
}

interface CommonDescribe extends Omit<typeof describe, "name"> {
  (name: `<common> <${TestCommon}>`, fn?: Function, timeout?: number): void;
}

export const caseIt = it as CaseIt;
export const caseDescribe = describe as CaseDescribe;
export const commonDescribe = describe as CommonDescribe;
