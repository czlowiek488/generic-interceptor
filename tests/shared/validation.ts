import { TestCaseDescribe, TestStrategyIt, TestCommonDescribe, TestCommonIt, TestResult } from "./enum";
import { readdirSync } from "fs";
import kebabCase from "lodash/kebabCase";

export const validateSubstringOverlapping = (payload: { strings: string[] }) => {
  const overlapping = payload.strings.reduce((acc, value, index) => {
    const overlap = payload.strings.find((value2, index2) => index !== index2 && value2.includes(value));
    return overlap === undefined ? acc : [...acc, { value, overlap }];
  }, []);
  if (overlapping.length > 0) {
    throw Error(`Test names are overlapping: ${overlapping.map((error) => JSON.stringify(error)).join(", ")}`);
  }
};
export const validateFilePresence = (payload: { directory: string; filenames: string[] }) => {
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

const enumValueToFilename = (testCase: string) => `${kebabCase(testCase)}.spec.ts`;

export default () => {
  validateSubstringOverlapping({
    strings: [TestCaseDescribe, TestCommonDescribe, TestResult, TestStrategyIt, TestCommonIt].map(Object.values).flat(),
  });
  validateFilePresence({
    directory: `${process.cwd()}/tests/case`,
    filenames: Object.values(TestCaseDescribe).map(enumValueToFilename),
  });
  validateFilePresence({
    directory: `${process.cwd()}/tests/common`,
    filenames: Object.values(TestCommonDescribe).map(enumValueToFilename),
  });
};
