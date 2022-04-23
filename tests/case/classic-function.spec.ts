import { OnErrorPayload, OnSuccessPayload, proxyHandlerGenericExecution, ProcessingType } from "../../src/index";
import { caseDescribe, caseIt } from "../shared/overrides";

const testingFunctionName = "testingFunctionName";

caseDescribe("<classic-function>", () => {
  caseIt("<sync> <error>", () => {
    const dataset = {
      error: Error(),
      options: {
        onSuccess: () => {},
        onNonFunction: () => {},
        onError: jest.fn(),
      },
      args: [1, 2, 3],
    };
    const target = {
      [testingFunctionName]: function () {
        throw dataset.error;
      },
    };
    const handler = proxyHandlerGenericExecution(dataset.options);

    const proxy = new Proxy(target, handler);

    expect(() => proxy[testingFunctionName](...dataset.args)).toThrow(dataset.error);
    expect(dataset.options.onError).toHaveBeenCalledTimes(1);
    expect(dataset.options.onError).toHaveBeenCalledWith({
      error: dataset.error,
      args: dataset.args,
      fieldKey: testingFunctionName,
      processingType: ProcessingType.sync,
      fieldValueType: typeof proxy[testingFunctionName],
    } as OnErrorPayload);
  });
  caseIt("<sync> <success>", () => {
    const dataset = {
      result: "RESULT",
      options: {
        onSuccess: jest.fn(),
        onNonFunction: () => {},
        onError: () => {},
      },
      args: [1, 2, 3],
    };
    const target = {
      [testingFunctionName]: function () {
        return dataset.result;
      },
    };
    const handler = proxyHandlerGenericExecution(dataset.options);

    const proxy = new Proxy(target, handler);

    expect(proxy[testingFunctionName](...dataset.args)).toEqual(dataset.result);
    expect(dataset.options.onSuccess).toHaveBeenCalledTimes(1);
    expect(dataset.options.onSuccess).toHaveBeenCalledWith({
      result: dataset.result,
      args: dataset.args,
      fieldKey: testingFunctionName,
      processingType: ProcessingType.sync,
      fieldValueType: typeof proxy[testingFunctionName],
    } as OnSuccessPayload);
  });
  caseIt("<promise> <error>", async () => {
    const dataset = {
      error: Error(),
      options: {
        onSuccess: () => {},
        onNonFunction: () => {},
        onError: jest.fn(),
      },
      args: [1, 2, 3],
    };
    const target = {
      [testingFunctionName]: async function () {
        throw dataset.error;
      },
    };
    const handler = proxyHandlerGenericExecution(dataset.options as any);

    const proxy = new Proxy(target, handler);

    await expect(proxy[testingFunctionName](...dataset.args)).rejects.toEqual(dataset.error);
    expect(dataset.options.onError).toHaveBeenCalledTimes(1);
    expect(dataset.options.onError).toHaveBeenCalledWith({
      error: dataset.error,
      args: dataset.args,
      fieldKey: testingFunctionName,
      processingType: ProcessingType.async,
      fieldValueType: typeof proxy[testingFunctionName],
    } as OnErrorPayload);
  });
  caseIt("<promise> <success>", async () => {
    const dataset = {
      result: "RESULT",
      options: {
        onSuccess: jest.fn(),
        onNonFunction: () => {},
        onError: () => {},
      },
      args: [1, 2, 3],
    };
    const target = {
      [testingFunctionName]: async function () {
        return dataset.result;
      },
    };
    const handler = proxyHandlerGenericExecution(dataset.options as any);

    const proxy = new Proxy(target, handler);

    await expect(proxy[testingFunctionName](...dataset.args)).resolves.toEqual(dataset.result);
    expect(dataset.options.onSuccess).toHaveBeenCalledTimes(1);
    expect(dataset.options.onSuccess).toHaveBeenCalledWith({
      result: dataset.result,
      args: dataset.args,
      fieldKey: testingFunctionName,
      processingType: ProcessingType.async,
      fieldValueType: typeof proxy[testingFunctionName],
    } as OnSuccessPayload);
  });
  caseIt("<callbackEnding> <error>", async () => {
    const dataset = {
      error: Error(),
      options: {
        callbackEnding: "promise",
        onSuccess: () => {},
        onNonFunction: () => {},
        onError: jest.fn(),
      },
      args: [1, 2, 3],
    };
    const target = {
      [testingFunctionName]: () => ({
        [dataset.options.callbackEnding]: async function () {
          throw dataset.error;
        },
      }),
    };
    const handler = proxyHandlerGenericExecution(dataset.options as any);

    const proxy = new Proxy(target, handler);

    await expect(proxy[testingFunctionName](...dataset.args)[dataset.options.callbackEnding]()).rejects.toEqual(
      dataset.error,
    );
    expect(dataset.options.onError).toHaveBeenCalledTimes(1);
    expect(dataset.options.onError).toHaveBeenCalledWith({
      error: dataset.error,
      args: dataset.args,
      fieldKey: testingFunctionName,
      processingType: ProcessingType.async,
      fieldValueType: typeof proxy[testingFunctionName],
    } as OnErrorPayload);
  });
  caseIt("<callbackEnding> <success>", async () => {
    const dataset = {
      result: "RESULT",
      options: {
        callbackEnding: "promise",
        onSuccess: jest.fn(),
        onNonFunction: () => {},
        onError: () => {},
      },
      args: [1, 2, 3],
    };
    const target = {
      [testingFunctionName]: () => ({
        [dataset.options.callbackEnding]: async function () {
          return dataset.result;
        },
      }),
    };
    const handler = proxyHandlerGenericExecution(dataset.options as any);

    const proxy = new Proxy(target, handler);

    await expect(proxy[testingFunctionName](...dataset.args)[dataset.options.callbackEnding]()).resolves.toEqual(
      dataset.result,
    );
    expect(dataset.options.onSuccess).toHaveBeenCalledTimes(1);
    expect(dataset.options.onSuccess).toHaveBeenCalledWith({
      result: dataset.result,
      args: dataset.args,
      fieldKey: testingFunctionName,
      processingType: ProcessingType.async,
      fieldValueType: typeof proxy[testingFunctionName],
    } as OnSuccessPayload);
  });
});
