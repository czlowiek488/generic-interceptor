import { execSync } from "child_process";
import { testCases } from "../shared/name";

testCases.forEach((testCase) =>
  execSync(`jest --config jestconfig.json --coverage --testNamePattern=${testCase}'|<common>'`, {
    stdio: "inherit",
  }),
);
