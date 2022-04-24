import { execSync } from "child_process";
import { TestCaseDescribe, TestPrefix } from "./enum";

Object.values(TestCaseDescribe).forEach((testCase) => {
  const command = `jest --config jestconfig.json --coverage --testNamePattern='${testCase}|<${TestPrefix.commonPrefix}>'`;
  execSync(command, { stdio: "inherit" });
});
