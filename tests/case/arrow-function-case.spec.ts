import { caseDescribe, strategyIt } from "../shared/jest";
import { testingFunctionName, loadStrategyToTemplate } from "../shared/generic-strategy";
import { TestResult, TestStrategyIt } from "../shared/enum";

const template = loadStrategyToTemplate({
  [TestStrategyIt.synchronousStrategy]: {
    [TestResult.functionError]: (dataset) => ({
      [testingFunctionName]: () => {
        throw dataset.functionError;
      },
    }),
    [TestResult.functionSuccess]: (dataset) => ({
      [testingFunctionName]: () => {
        return dataset.functionResult;
      },
    }),
  },
  [TestStrategyIt.callbackEndingStrategy]: {
    [TestResult.functionError]: (dataset) => ({
      [testingFunctionName]: () => ({
        [dataset.options.callbackEnding]: async () => {
          throw dataset.functionError;
        },
      }),
    }),
    [TestResult.functionSuccess]: (dataset) => ({
      [testingFunctionName]: () => ({
        [dataset.options.callbackEnding]: async () => dataset.functionResult,
      }),
    }),
  },
  [TestStrategyIt.promiseStrategy]: {
    [TestResult.functionError]: (dataset) => ({
      [testingFunctionName]: async () => {
        throw dataset.functionError;
      },
    }),
    [TestResult.functionSuccess]: (dataset) => ({
      [testingFunctionName]: async () => dataset.functionResult,
    }),
  },
});

caseDescribe("<arrow function case>", () => {
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
