import { caseDescribe, strategyIt } from "../shared/jest";
import { parameterName, loadStrategyToTemplate, caseTemplate } from "../shared/generic-strategy";
import { TestStrategyResult, TestStrategyIt } from "../shared/enum";

const template = loadStrategyToTemplate(caseTemplate, {
  [TestStrategyIt.synchronousStrategy]: {
    [TestStrategyResult.functionError]: (dataset) => ({
      [parameterName]: function () {
        throw dataset.functionError;
      },
    }),
    [TestStrategyResult.functionSuccess]: (dataset) => ({
      [parameterName]: function () {
        return dataset.functionResult;
      },
    }),
  },
  [TestStrategyIt.callbackEndingStrategy]: {
    [TestStrategyResult.functionError]: (dataset) => ({
      [parameterName]: function () {
        return {
          [dataset.options.callbackEnding]: async function () {
            throw dataset.functionError;
          },
        };
      },
    }),
    [TestStrategyResult.functionSuccess]: (dataset) => ({
      [parameterName]: function () {
        return {
          [dataset.options.callbackEnding]: async function () {
            return dataset.functionResult;
          },
        };
      },
    }),
  },
  [TestStrategyIt.promiseStrategy]: {
    [TestStrategyResult.functionError]: (dataset) => ({
      [parameterName]: async function () {
        throw dataset.functionError;
      },
    }),
    [TestStrategyResult.functionSuccess]: (dataset) => ({
      [parameterName]: async function () {
        return dataset.functionResult;
      },
    }),
  },
});

caseDescribe("<classic function case>", () => {
  strategyIt(
    "<synchronous strategy> <function error result>",
    template(TestStrategyIt.synchronousStrategy, TestStrategyResult.functionError),
  );
  strategyIt(
    "<synchronous strategy> <function success result>",
    template(TestStrategyIt.synchronousStrategy, TestStrategyResult.functionSuccess),
  );
  strategyIt(
    "<callback ending strategy> <function error result>",
    template(TestStrategyIt.callbackEndingStrategy, TestStrategyResult.functionError),
  );
  strategyIt(
    "<callback ending strategy> <function success result>",
    template(TestStrategyIt.callbackEndingStrategy, TestStrategyResult.functionSuccess),
  );
  strategyIt(
    "<promise async strategy> <function error result>",
    template(TestStrategyIt.promiseStrategy, TestStrategyResult.functionError),
  );
  strategyIt(
    "<promise async strategy> <function success result>",
    template(TestStrategyIt.promiseStrategy, TestStrategyResult.functionSuccess),
  );
});
