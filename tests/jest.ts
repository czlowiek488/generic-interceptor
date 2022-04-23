import { testCaseFileExistence, testEnumsOverlapping } from "./shared/test-consistency";

export default () => {
  testEnumsOverlapping();
  testCaseFileExistence();
};
