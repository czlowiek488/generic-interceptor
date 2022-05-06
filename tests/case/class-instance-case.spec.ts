import { caseDescribe, strategyIt } from "../shared/jest";
import { parameterName, loadStrategyToTemplate, caseTemplate } from "../shared/generic-strategy";
import { TestStrategyResult, TestStrategyIt } from "../shared/enum";
interface Test {
  [parameterName](): any;
}

const SynchronousTest = (settings: { action: "return" | "throw"; value: any }) =>
  class implements Test {
    [parameterName]() {
      if (settings.action === "throw") {
        throw settings.value;
      } else if (settings.action === "return") {
        return settings.value;
      }
      throw Error("Invalid Action in class instance test case");
    }
  };

const CallbackEndingTest = (settings: { action: "return" | "throw"; value: any; callbackEnding: string }) =>
  class implements Test {
    async [settings.callbackEnding]() {
      if (settings.action === "throw") {
        throw settings.value;
      } else if (settings.action === "return") {
        return settings.value;
      }
      throw Error("Invalid Action in class instance test case");
    }

    [parameterName]() {
      return this;
    }
  };

const PromiseTest = (settings: { action: "return" | "throw"; value: any }) =>
  class implements Test {
    async [parameterName]() {
      if (settings.action === "throw") {
        throw settings.value;
      } else if (settings.action === "return") {
        return settings.value;
      }
      throw Error("Invalid Action in class instance test case");
    }
  };

const template = loadStrategyToTemplate(caseTemplate, {
  [TestStrategyIt.synchronousStrategy]: {
    [TestStrategyResult.functionError]: (dataset) =>
      new (SynchronousTest({ action: "throw", value: dataset.functionError }))(),
    [TestStrategyResult.functionSuccess]: (dataset) =>
      new (SynchronousTest({ action: "return", value: dataset.functionResult }))(),
  },
  [TestStrategyIt.callbackEndingStrategy]: {
    [TestStrategyResult.functionError]: (dataset) =>
      new (CallbackEndingTest({
        action: "throw",
        value: dataset.functionError,
        callbackEnding: dataset.options.callbackEnding,
      }))(),
    [TestStrategyResult.functionSuccess]: (dataset) =>
      new (CallbackEndingTest({
        action: "return",
        value: dataset.functionResult,
        callbackEnding: dataset.options.callbackEnding,
      }))(),
  },
  [TestStrategyIt.promiseStrategy]: {
    [TestStrategyResult.functionError]: (dataset) =>
      new (PromiseTest({ action: "throw", value: dataset.functionError }))(),
    [TestStrategyResult.functionSuccess]: (dataset) =>
      new (PromiseTest({ action: "return", value: dataset.functionResult }))(),
  },
});

caseDescribe("<class instance case>", () => {
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
