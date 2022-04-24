import { caseDescribe, strategyIt } from "../shared/jest";
import { testingFunctionName, loadStrategyToTemplate } from "../shared/generic-strategy";
import { TestResult, TestStrategyIt } from "../shared/enum";

const template = loadStrategyToTemplate({
  [TestStrategyIt.synchronousStrategy]: {
    [TestResult.functionError]: (dataset) => ({
      [testingFunctionName]: function () {
        throw dataset.functionError;
      },
    }),
    [TestResult.functionSuccess]: (dataset) => ({
      [testingFunctionName]: function () {
        return dataset.functionResult;
      },
    }),
  },
  [TestStrategyIt.callbackEndingStrategy]: {
    [TestResult.functionError]: (dataset) => ({
      [testingFunctionName]: function () {
        return {
          [dataset.options.callbackEnding]: async function () {
            throw dataset.functionError;
          },
        };
      },
    }),
    [TestResult.functionSuccess]: (dataset) => ({
      [testingFunctionName]: function () {
        return {
          [dataset.options.callbackEnding]: async function () {
            return dataset.functionResult;
          },
        };
      },
    }),
  },
  [TestStrategyIt.promiseStrategy]: {
    [TestResult.functionError]: (dataset) => ({
      [testingFunctionName]: async function () {
        throw dataset.functionError;
      },
    }),
    [TestResult.functionSuccess]: (dataset) => ({
      [testingFunctionName]: async function () {
        return dataset.functionResult;
      },
    }),
  },
});

caseDescribe("<classic function case>", () => {
  strategyIt(
    "<synchronous strategy> <function error result>",
    template(TestStrategyIt.synchronousStrategy, TestResult.functionError),
  );
  strategyIt(
    "<synchronous strategy> <function success result>",
    template(TestStrategyIt.synchronousStrategy, TestResult.functionSuccess),
  );
  strategyIt(
    "<callback ending strategy> <function error result>",
    template(TestStrategyIt.callbackEndingStrategy, TestResult.functionError),
  );
  strategyIt(
    "<callback ending strategy> <function success result>",
    template(TestStrategyIt.callbackEndingStrategy, TestResult.functionSuccess),
  );
  strategyIt(
    "<promise async strategy> <function error result>",
    template(TestStrategyIt.promiseStrategy, TestResult.functionError),
  );
  strategyIt(
    "<promise async strategy> <function success result>",
    template(TestStrategyIt.promiseStrategy, TestResult.functionSuccess),
  );
});
