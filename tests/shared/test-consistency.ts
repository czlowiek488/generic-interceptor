import { readdirSync } from "fs";
import { testCases, testCommon, testResult, testType } from "./name";

const getOverlapping = (array: string[]) =>
  array.reduce((acc, value, index) => {
    const overlap = array.find((value2, index2) => index !== index2 && value2.includes(value));
    return overlap === undefined ? acc : [...acc, { value, overlap }];
  }, []);

export const testEnumsOverlapping = () => {
  const overlapping = getOverlapping([...testCases, ...testCommon, ...testResult, ...testType]);
  if (overlapping.length > 0) {
    throw Error(`Test names are overlapping: ${overlapping.map((error) => JSON.stringify(error)).join(", ")}`);
  }
};

export const testCaseFileExistence = () => {
  const directoryFiles = readdirSync(`${process.cwd()}/tests/case`);
  const missingCases = testCases.filter((testCase) => !directoryFiles.includes(`${testCase}.spec.ts`));
  if (missingCases.length > 0) {
    throw Error(`Test cases are declared but files for them are not found: [${missingCases.join(", ")}]`);
  }
};
