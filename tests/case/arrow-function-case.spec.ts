import {
  OnErrorPayload,
  OnSuccessPayload,
  proxyHandlerGenericExecution,
  ProcessingType,
  ProcessingResult,
} from "../../src/index";
import { caseDescribe, caseIt } from "../shared/jest";

const testingFunctionName = "testingFunctionName";

caseDescribe("<arrow function case>", () => {
  caseIt("<synchronous strategy> <function error result>", () => {
    const dataset = {
      functionError: Error(),
      options: {
        onSuccess: () => {},
        onNonFunction: () => {},
        onError: jest.fn(),
      },
      functionArgs: [1, 2, 3],
    };
    const target = {
      [testingFunctionName]: () => {
        throw dataset.functionError;
      },
    };
    const handler = proxyHandlerGenericExecution(dataset.options);

    const proxy = new Proxy(target, handler);

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
  });
  caseIt("<synchronous strategy> <function success result>", () => {
    const dataset = {
      functionResult: "RESULT",
      options: {
        onSuccess: jest.fn(),
        onNonFunction: () => {},
        onError: () => {},
      },
      functionArgs: [1, 2, 3],
    };
    const target = {
      [testingFunctionName]: () => dataset.functionResult,
    };
    const handler = proxyHandlerGenericExecution(dataset.options);

    const proxy = new Proxy(target, handler);

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
  });
  caseIt("<promise async strategy> <function error result>", async () => {
    const dataset = {
      functionError: Error(),
      options: {
        onSuccess: () => {},
        onNonFunction: () => {},
        onError: jest.fn(),
      },
      functionArgs: [1, 2, 3],
    };
    const target = {
      [testingFunctionName]: async () => {
        throw dataset.functionError;
      },
    };
    const handler = proxyHandlerGenericExecution(dataset.options as any);

    const proxy = new Proxy(target, handler);

    await expect(proxy[testingFunctionName](...dataset.functionArgs)).rejects.toEqual(dataset.functionError);
    expect(dataset.options.onError).toHaveBeenCalledTimes(1);
    expect(dataset.options.onError).toHaveBeenCalledWith({
      functionError: dataset.functionError,
      functionArgs: dataset.functionArgs,
      fieldKey: testingFunctionName,
      processingResult: ProcessingResult.failed,
      processingStrategy: ProcessingType.promise,
      fieldValueType: typeof proxy[testingFunctionName],
    } as OnErrorPayload);
  });
  caseIt("<promise async strategy> <function success result>", async () => {
    const dataset = {
      functionResult: "RESULT",
      options: {
        onSuccess: jest.fn(),
        onNonFunction: () => {},
        onError: () => {},
      },
      functionArgs: [1, 2, 3],
    };
    const target = {
      [testingFunctionName]: async () => dataset.functionResult,
    };
    const handler = proxyHandlerGenericExecution(dataset.options as any);

    const proxy = new Proxy(target, handler);

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
  });
  caseIt("<callback ending strategy> <function error result>", async () => {
    const dataset = {
      functionError: Error(),
      options: {
        callbackEnding: "promise",
        onSuccess: () => {},
        onNonFunction: () => {},
        onError: jest.fn(),
      },
      functionArgs: [1, 2, 3],
    };
    const target = {
      [testingFunctionName]: () => ({
        [dataset.options.callbackEnding]: async () => {
          throw dataset.functionError;
        },
      }),
    };
    const handler = proxyHandlerGenericExecution(dataset.options as any);

    const proxy = new Proxy(target, handler);

    await expect(proxy[testingFunctionName](...dataset.functionArgs)[dataset.options.callbackEnding]()).rejects.toEqual(
      dataset.functionError,
    );
    expect(dataset.options.onError).toHaveBeenCalledTimes(1);
    expect(dataset.options.onError).toHaveBeenCalledWith({
      functionError: dataset.functionError,
      functionArgs: dataset.functionArgs,
      fieldKey: testingFunctionName,
      processingResult: ProcessingResult.failed,
      processingStrategy: ProcessingType.promise,
      fieldValueType: typeof proxy[testingFunctionName],
    } as OnErrorPayload);
  });
  caseIt("<callback ending strategy> <function success result>", async () => {
    const dataset = {
      functionResult: "RESULT",
      options: {
        callbackEnding: "promise",
        onSuccess: jest.fn(),
        onNonFunction: () => {},
        onError: () => {},
      },
      functionArgs: [1, 2, 3],
    };
    const target = {
      [testingFunctionName]: () => ({
        [dataset.options.callbackEnding]: async () => dataset.functionResult,
      }),
    };
    const handler = proxyHandlerGenericExecution(dataset.options as any);

    const proxy = new Proxy(target, handler);

    await expect(
      proxy[testingFunctionName](...dataset.functionArgs)[dataset.options.callbackEnding](),
    ).resolves.toEqual(dataset.functionResult);
    expect(dataset.options.onSuccess).toHaveBeenCalledTimes(1);
    expect(dataset.options.onSuccess).toHaveBeenCalledWith({
      functionResult: dataset.functionResult,
      functionArgs: dataset.functionArgs,
      fieldKey: testingFunctionName,
      processingResult: ProcessingResult.succeed,
      processingStrategy: ProcessingType.promise,
      fieldValueType: typeof proxy[testingFunctionName],
    } as OnSuccessPayload);
  });
});
