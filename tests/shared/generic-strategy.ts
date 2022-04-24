import { DeepPartial, Required as UtilRequired } from "utility-types";
import {
  CallbackEnding,
  ExecutionFunction,
  FunctionCallbackPayload,
  NonFunctionFieldValue,
  OnErrorAdditionalPayload,
  OnErrorPayload,
  OnSuccessAdditionalPayload,
  OnSuccessPayload,
  ProcessingResult,
  ProcessingType,
  proxyHandlerGenericExecution,
  ProxyHandlerGenericExecutionOptions,
} from "../../src";
import { TestStrategyIt, TestStrategyResult } from "./enum";
import { JestFunction } from "./jest";

export const parameterName = "parameterName";
export const functionError: OnErrorAdditionalPayload["functionError"] = Error();
export const functionResult: OnSuccessAdditionalPayload["functionResult"] = "RESULT";
export const callbackEnding: CallbackEnding = "promise";
export interface CommonDataset {
  options: ProxyHandlerGenericExecutionOptions;
  functionArgs: FunctionCallbackPayload["functionArgs"];
}
export interface ErrorDataset {
  functionError: OnErrorAdditionalPayload["functionError"];
}
export interface ResultDataset {
  functionResult: OnSuccessAdditionalPayload["functionResult"];
}
export type Dataset = CommonDataset & (ErrorDataset | ResultDataset | {});
export type StrategyInput = { [parameterName]: ExecutionFunction | NonFunctionFieldValue };
export type StrategyInputFactory<TestStrategyName extends TestStrategyIt, TestResultKey extends TestStrategyResult> = (
  dataset: Omit<CommonDataset, "options"> & {
    options: TestStrategyName extends TestStrategyIt.callbackEndingStrategy
      ? UtilRequired<CommonDataset["options"], "callbackEnding">
      : CommonDataset["options"];
  } & (TestResultKey extends TestStrategyResult.functionError ? ErrorDataset : ResultDataset),
) => StrategyInput;
export type CaseItFunction = (
  strategyFactory: StrategyInputFactory<TestStrategyIt, TestStrategyResult>,
) => JestFunction;
export type Strategy = { [key in TestStrategyIt]: { [key2 in TestStrategyResult]: StrategyInputFactory<key, key2> } };
export type CaseTemplate = { [key in TestStrategyIt]: { [key2 in TestStrategyResult]: CaseItFunction } };
export const loadStrategyToTemplate =
  (caseTemplate: CaseTemplate, strategy: Strategy) => (strategyName: TestStrategyIt, testResult: TestStrategyResult) =>
    caseTemplate[strategyName][testResult](strategy[strategyName][testResult]);
export const prepareProxy = (dataset: Dataset, strategyInput: StrategyInput) =>
  new Proxy(strategyInput, proxyHandlerGenericExecution(dataset.options));
export const prepareDataset = <T extends ErrorDataset | ResultDataset | {}>(data: DeepPartial<CommonDataset> & T) => {
  data.options = data.options || ({} as ProxyHandlerGenericExecutionOptions);
  data.options.onSuccess = data.options.onSuccess || (() => {});
  data.options.onError = data.options.onError || (() => {});
  data.options.onNonFunction = data.options.onNonFunction || (() => {});
  data.functionArgs = data.functionArgs || [1, 2, 3];
  return data as CommonDataset & T;
};
export const caseTemplate: CaseTemplate = {
  [TestStrategyIt.synchronousStrategy]: {
    [TestStrategyResult.functionError]: (strategyFactory) => () => {
      const dataset = prepareDataset({ options: { onError: jest.fn() }, functionError });
      const proxy = prepareProxy(dataset, strategyFactory(dataset));

      expect(() => proxy[parameterName](...dataset.functionArgs)).toThrow(dataset.functionError);
      expect(dataset.options.onError).toHaveBeenCalledTimes(1);
      expect(dataset.options.onError).toHaveBeenCalledWith({
        functionError: dataset.functionError,
        functionArgs: dataset.functionArgs,
        fieldKey: parameterName,
        processingResult: ProcessingResult.failed,
        processingStrategy: ProcessingType.synchronous,
        fieldValueType: typeof proxy[parameterName],
      } as OnErrorPayload);
    },
    [TestStrategyResult.functionSuccess]: (strategyFactory) => () => {
      const dataset = prepareDataset({ functionResult, options: { onSuccess: jest.fn() } });
      const proxy = prepareProxy(dataset, strategyFactory(dataset));

      expect(proxy[parameterName](...dataset.functionArgs)).toEqual(dataset.functionResult);
      expect(dataset.options.onSuccess).toHaveBeenCalledTimes(1);
      expect(dataset.options.onSuccess).toHaveBeenCalledWith({
        functionResult: dataset.functionResult,
        functionArgs: dataset.functionArgs,
        fieldKey: parameterName,
        processingResult: ProcessingResult.succeed,
        processingStrategy: ProcessingType.synchronous,
        fieldValueType: typeof proxy[parameterName],
      } as OnSuccessPayload);
    },
  },
  [TestStrategyIt.callbackEndingStrategy]: {
    [TestStrategyResult.functionError]: (strategyFactory) => async () => {
      const dataset = prepareDataset({ options: { onError: jest.fn(), callbackEnding }, functionError });
      const proxy = prepareProxy(dataset, strategyFactory(dataset));

      await expect(() =>
        proxy[parameterName](...dataset.functionArgs)[dataset.options.callbackEnding](),
      ).rejects.toEqual(dataset.functionError);
      expect(dataset.options.onError).toHaveBeenCalledTimes(1);
      expect(dataset.options.onError).toHaveBeenCalledWith({
        functionError: dataset.functionError,
        functionArgs: dataset.functionArgs,
        fieldKey: parameterName,
        processingResult: ProcessingResult.failed,
        processingStrategy: ProcessingType.callbackEnding,
        fieldValueType: typeof proxy[parameterName],
      } as OnErrorPayload);
    },
    [TestStrategyResult.functionSuccess]: (strategyFactory) => async () => {
      const dataset = prepareDataset({ functionResult, options: { onSuccess: jest.fn(), callbackEnding } });
      const proxy = prepareProxy(dataset, strategyFactory(dataset));

      await expect(proxy[parameterName](...dataset.functionArgs)[dataset.options.callbackEnding]()).resolves.toEqual(
        dataset.functionResult,
      );
      expect(dataset.options.onSuccess).toHaveBeenCalledTimes(1);
      expect(dataset.options.onSuccess).toHaveBeenCalledWith({
        functionResult: dataset.functionResult,
        functionArgs: dataset.functionArgs,
        fieldKey: parameterName,
        processingResult: ProcessingResult.succeed,
        processingStrategy: ProcessingType.callbackEnding,
        fieldValueType: typeof proxy[parameterName],
      } as OnSuccessPayload);
    },
  },
  [TestStrategyIt.promiseStrategy]: {
    [TestStrategyResult.functionError]: (strategyFactory) => async () => {
      const dataset = prepareDataset({ options: { onError: jest.fn() }, functionError });
      const proxy = prepareProxy(dataset, strategyFactory(dataset));

      await expect(() => proxy[parameterName](...dataset.functionArgs)).rejects.toEqual(dataset.functionError);
      expect(dataset.options.onError).toHaveBeenCalledTimes(1);
      expect(dataset.options.onError).toHaveBeenCalledWith({
        functionError: dataset.functionError,
        functionArgs: dataset.functionArgs,
        fieldKey: parameterName,
        processingResult: ProcessingResult.failed,
        processingStrategy: ProcessingType.promise,
        fieldValueType: typeof proxy[parameterName],
      } as OnErrorPayload);
    },
    [TestStrategyResult.functionSuccess]: (strategyFactory) => async () => {
      const dataset = prepareDataset({ functionResult, options: { onSuccess: jest.fn() } });
      const proxy = prepareProxy(dataset, strategyFactory(dataset));

      await expect(proxy[parameterName](...dataset.functionArgs)).resolves.toEqual(dataset.functionResult);
      expect(dataset.options.onSuccess).toHaveBeenCalledTimes(1);
      expect(dataset.options.onSuccess).toHaveBeenCalledWith({
        functionResult: dataset.functionResult,
        functionArgs: dataset.functionArgs,
        fieldKey: parameterName,
        processingResult: ProcessingResult.succeed,
        processingStrategy: ProcessingType.promise,
        fieldValueType: typeof proxy[parameterName],
      } as OnSuccessPayload);
    },
  },
};
