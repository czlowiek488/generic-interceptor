import { execSync } from "child_process";
import { Prefix, TestCaseDescribe } from "../shared/enum";

Object.values(TestCaseDescribe).forEach((testCase) => {
  const command = `jest --config jestconfig.json --coverage --testNamePattern='${testCase}|<${Prefix.commonPrefix}>'`;
  execSync(command, { stdio: "inherit" });
});
