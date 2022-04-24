import { TestCaseDescribe, TestCaseIt, TestCommonDescribe, TestCommonIt, TestResult } from "./shared/enum";
import { readdirSync } from "fs";

export const testOverlapping = (payload: { strings: string[] }) => {
  const overlapping = payload.strings.reduce((acc, value, index) => {
    const overlap = payload.strings.find((value2, index2) => index !== index2 && value2.includes(value));
    return overlap === undefined ? acc : [...acc, { value, overlap }];
  }, []);
  if (overlapping.length > 0) {
    throw Error(`Test names are overlapping: ${overlapping.map((error) => JSON.stringify(error)).join(", ")}`);
  }
};
export const testFileExistence = (payload: { directory: string; filenames: string[] }) => {
  const directoryFiles = readdirSync(payload.directory);
  const missingCases = payload.filenames.filter((testCase) => !directoryFiles.includes(testCase));
  if (missingCases.length > 0) {
    throw Error(
      `Test cases are declared but files for them are not found: [${missingCases.join(
        ", ",
      )}], in [${directoryFiles.join(", ")}]`,
    );
  }
};

export default () => {
  testOverlapping({
    strings: [TestCaseDescribe, TestCommonDescribe, TestResult, TestCaseIt, TestCommonIt].map(Object.values).flat(),
  });
  testFileExistence({
    directory: `${process.cwd()}/tests/case`,
    filenames: Object.values(TestCaseDescribe).map((testCase) => `${testCase.replace(/ /g, "-")}.spec.ts`),
  });
  testFileExistence({
    directory: `${process.cwd()}/tests/common`,
    filenames: Object.values(TestCommonDescribe).map((testCase) => `${testCase.replace(/ /g, "-")}.spec.ts`),
  });
};
