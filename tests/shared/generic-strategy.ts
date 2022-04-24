import { DeepPartial } from "utility-types";
import {
  OnErrorPayload,
  OnSuccessPayload,
  ProcessingResult,
  ProcessingType,
  proxyHandlerGenericExecution,
  ProxyHandlerGenericExecutionOptions,
} from "../../src";
import { TestStrategyIt, TestResult } from "./enum";
import { JestFunction } from "./jest";

export const testingFunctionName = "testingFunctionName";
export const functionError = Error();
export const functionResult = "RESULT";
export const callbackEnding = "promise";
export interface CommonDataset<T = any> {
  options: ProxyHandlerGenericExecutionOptions<T>;
  functionArgs: any[];
}
export interface ErrorDataset {
  functionError: Error;
}
export interface ResultDataset {
  functionResult: any;
}
export type Dataset = CommonDataset & (ErrorDataset | ResultDataset);
export type StrategyInput = { [testingFunctionName]: () => any };
export type StrategyInputFactory<StrategyKey extends TestStrategyIt, TestResultKey extends TestResult> = (
  dataset: CommonDataset<StrategyKey extends TestStrategyIt.callbackEndingStrategy ? string : undefined> &
    (TestResultKey extends TestResult.functionError ? ErrorDataset : ResultDataset),
) => StrategyInput;
export type Strategy = {
  [StrategyKey in TestStrategyIt]: { [TestResultKey in TestResult]: StrategyInputFactory<StrategyKey, TestResultKey> };
};
export type StrategyFactory = (strategyFactory: StrategyInputFactory<TestStrategyIt, TestResult>) => JestFunction;
export type CaseTemplateObject = {
  [key in TestStrategyIt]: {
    [key2 in TestResult]: StrategyFactory;
  };
};
export const prepareDataset = <T extends ErrorDataset | ResultDataset>(data: DeepPartial<CommonDataset> & T) => {
  data.options = data.options || ({} as ProxyHandlerGenericExecutionOptions);
  data.options.onSuccess = data.options.onSuccess || (() => {});
  data.options.onError = data.options.onError || (() => {});
  data.options.onNonFunction = data.options.onNonFunction || (() => {});
  data.functionArgs = data.functionArgs || [1, 2, 3];
  return data as CommonDataset & T;
};
export const prepareProxy = (dataset: Dataset, target: { [testingFunctionName]: Function }) =>
  new Proxy(target, proxyHandlerGenericExecution(dataset.options));
export const caseTestTemplate: CaseTemplateObject = {
  [TestStrategyIt.synchronousStrategy]: {
    [TestResult.functionError]: (strategyFactory) => () => {
      const dataset = prepareDataset({ options: { onError: jest.fn() }, functionError });
      const proxy = prepareProxy(dataset, strategyFactory(dataset));

      expect(() => proxy[testingFunctionName](...dataset.functionArgs)).toThrow(dataset.functionError);
      expect(dataset.options.onError).toHaveBeenCalledTimes(1);
      expect(dataset.options.onError).toHaveBeenCalledWith({
        functionError: dataset.functionError,
        functionArgs: dataset.functionArgs,
        fieldKey: testingFunctionName,
        processingResult: ProcessingResult.failed,
        processingStrategy: ProcessingType.synchronous,
        fieldValueType: typeof proxy[testingFunctionName],
      } as OnErrorPayload);
    },
    [TestResult.functionSuccess]: (strategyFactory) => () => {
      const dataset = prepareDataset({ functionResult, options: { onSuccess: jest.fn() } });
      const proxy = prepareProxy(dataset, strategyFactory(dataset));

      expect(proxy[testingFunctionName](...dataset.functionArgs)).toEqual(dataset.functionResult);
      expect(dataset.options.onSuccess).toHaveBeenCalledTimes(1);
      expect(dataset.options.onSuccess).toHaveBeenCalledWith({
        functionResult: dataset.functionResult,
        functionArgs: dataset.functionArgs,
        fieldKey: testingFunctionName,
        processingResult: ProcessingResult.succeed,
        processingStrategy: ProcessingType.synchronous,
        fieldValueType: typeof proxy[testingFunctionName],
      } as OnSuccessPayload);
    },
  },
  [TestStrategyIt.callbackEndingStrategy]: {
    [TestResult.functionError]: (strategyFactory) => async () => {
      const dataset = prepareDataset({ options: { onError: jest.fn(), callbackEnding }, functionError });
      const proxy = prepareProxy(dataset, strategyFactory(dataset));

      await expect(() =>
        proxy[testingFunctionName](...dataset.functionArgs)[dataset.options.callbackEnding](),
      ).rejects.toEqual(dataset.functionError);
      expect(dataset.options.onError).toHaveBeenCalledTimes(1);
      expect(dataset.options.onError).toHaveBeenCalledWith({
        functionError: dataset.functionError,
        functionArgs: dataset.functionArgs,
        fieldKey: testingFunctionName,
        processingResult: ProcessingResult.failed,
        processingStrategy: ProcessingType.callbackEnding,
        fieldValueType: typeof proxy[testingFunctionName],
      } as OnErrorPayload);
    },
    [TestResult.functionSuccess]: (strategyFactory) => async () => {
      const dataset = prepareDataset({ functionResult, options: { onSuccess: jest.fn(), callbackEnding } });
      const proxy = prepareProxy(dataset, strategyFactory(dataset));

      await expect(
        proxy[testingFunctionName](...dataset.functionArgs)[dataset.options.callbackEnding](),
      ).resolves.toEqual(dataset.functionResult);
      expect(dataset.options.onSuccess).toHaveBeenCalledTimes(1);
      expect(dataset.options.onSuccess).toHaveBeenCalledWith({
        functionResult: dataset.functionResult,
        functionArgs: dataset.functionArgs,
        fieldKey: testingFunctionName,
        processingResult: ProcessingResult.succeed,
        processingStrategy: ProcessingType.callbackEnding,
        fieldValueType: typeof proxy[testingFunctionName],
      } as OnSuccessPayload);
    },
  },
  [TestStrategyIt.promiseStrategy]: {
    [TestResult.functionError]: (strategyFactory) => async () => {
      const dataset = prepareDataset({ options: { onError: jest.fn() }, functionError });
      const proxy = prepareProxy(dataset, strategyFactory(dataset));

      await expect(() => proxy[testingFunctionName](...dataset.functionArgs)).rejects.toEqual(dataset.functionError);
      expect(dataset.options.onError).toHaveBeenCalledTimes(1);
      expect(dataset.options.onError).toHaveBeenCalledWith({
        functionError: dataset.functionError,
        functionArgs: dataset.functionArgs,
        fieldKey: testingFunctionName,
        processingResult: ProcessingResult.failed,
        processingStrategy: ProcessingType.promise,
        fieldValueType: typeof proxy[testingFunctionName],
      } as OnErrorPayload);
    },
    [TestResult.functionSuccess]: (strategyFactory) => async () => {
      const dataset = prepareDataset({ functionResult, options: { onSuccess: jest.fn() } });
      const proxy = prepareProxy(dataset, strategyFactory(dataset));

      await expect(proxy[testingFunctionName](...dataset.functionArgs)).resolves.toEqual(dataset.functionResult);
      expect(dataset.options.onSuccess).toHaveBeenCalledTimes(1);
      expect(dataset.options.onSuccess).toHaveBeenCalledWith({
        functionResult: dataset.functionResult,
        functionArgs: dataset.functionArgs,
        fieldKey: testingFunctionName,
        processingResult: ProcessingResult.succeed,
        processingStrategy: ProcessingType.promise,
        fieldValueType: typeof proxy[testingFunctionName],
      } as OnSuccessPayload);
    },
  },
};

export const loadStrategyToTemplate = (strategy: Strategy) => (strategyName: TestStrategyIt, testResult: TestResult) =>
  caseTestTemplate[strategyName][testResult](strategy[strategyName][testResult]);
