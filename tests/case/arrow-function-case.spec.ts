import { caseDescribe, strategyIt } from "../shared/jest";
import { parameterName, loadStrategyToTemplate, caseTemplate } from "../shared/generic-strategy";
import { TestStrategyResult, TestStrategyIt } from "../shared/enum";

const template = loadStrategyToTemplate(caseTemplate, {
  [TestStrategyIt.synchronousStrategy]: {
    [TestStrategyResult.functionError]: (dataset) => ({
      [parameterName]: () => {
        throw dataset.functionError;
      },
    }),
    [TestStrategyResult.functionSuccess]: (dataset) => ({
      [parameterName]: () => {
        return dataset.functionResult;
      },
    }),
  },
  [TestStrategyIt.callbackEndingStrategy]: {
    [TestStrategyResult.functionError]: (dataset) => ({
      [parameterName]: () => ({
        [dataset.options.callbackEnding]: async () => {
          throw dataset.functionError;
        },
      }),
    }),
    [TestStrategyResult.functionSuccess]: (dataset) => ({
      [parameterName]: () => ({
        [dataset.options.callbackEnding]: async () => dataset.functionResult,
      }),
    }),
  },
  [TestStrategyIt.promiseStrategy]: {
    [TestStrategyResult.functionError]: (dataset) => ({
      [parameterName]: async () => {
        throw dataset.functionError;
      },
    }),
    [TestStrategyResult.functionSuccess]: (dataset) => ({
      [parameterName]: async () => dataset.functionResult,
    }),
  },
});

caseDescribe("<arrow function case>", () => {
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
