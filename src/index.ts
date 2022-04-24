export type CallbackEnding = string;
export type ExecutionFunction = Function;
export type NonFunctionFieldValue = unknown;
export enum ProcessingType {
  synchronous = "synchronous",
  promise = "promise async",
  callbackEnding = "callback ending",
}
export enum ProcessingResult {
  succeed = "succeed",
  failed = "failed",
}
export interface CallbackPayload {
  fieldValueType: string;
  fieldKey: string;
}
export interface FunctionCallbackPayload {
  processingStrategy: ProcessingType;
  functionArgs: unknown[];
}
export interface OnErrorAdditionalPayload {
  processingResult: ProcessingResult.failed;
  functionError: Error;
}
export interface OnSuccessAdditionalPayload {
  processingResult: ProcessingResult.succeed;
  functionResult: unknown;
}
export type OnErrorPayload = CallbackPayload & FunctionCallbackPayload & OnErrorAdditionalPayload;
export type OnSuccessPayload = CallbackPayload & FunctionCallbackPayload & OnSuccessAdditionalPayload;
export type OnNonFunctionPayload = CallbackPayload;
export type OnErrorResult = OnErrorAdditionalPayload["functionError"] | void;
export type OnSuccessResult = void;
export type OnNonFunctionResult = void;
export type OnError = (payload: OnErrorPayload) => OnErrorResult;
export type OnSuccess = (payload: OnSuccessPayload) => OnSuccessResult;
export type OnNonFunction = (payload: OnNonFunctionPayload) => OnNonFunctionResult;

export type ProxyHandlerGenericExecutionOptions = {
  onError: OnError;
  onSuccess: OnSuccess;
  onNonFunction: OnNonFunction;
  /**
   * @description
   *`callbackEnding` this field is used when an object (on which this proxy handler is applied) function use callback style to return value and have callback to promise transformation function. This field define a name of a callback to promise transformation function which should be executed after primary function execution.
   * @example
   * ```
   * import { StepFunctions } from "aws-sdk";
   * import { proxyHandlerGenericExecution } from "proxy-handler-generic-execution";
   *
   * const callbackEnding = "promise";
   * const stepFunctions = new StepFunctions();
   * const wrappedStepFunctions = new Proxy(
   *   stepFunctions,
   *   proxyHandlerGenericExecution({
   *     callbackEnding,
   *     onSuccess: () => {},
   *     onNonFunction: () => {},
   *     onError: () => {},
   *   }),
   * );
   *
   * (async () => {
   *   await wrappedStepFunctions.startExecution({ stateMachineArn: "ARN" })[callbackEnding]();
   * })();
   * ```
   */
  callbackEnding?: CallbackEnding;
};

export type ProxyHandlerGenericExecution = (options: ProxyHandlerGenericExecutionOptions) => ProxyHandler<any>;

export const proxyHandlerGenericExecution: ProxyHandlerGenericExecution = (options) => ({
  get: (target, key) => {
    const fieldValueType: CallbackPayload["fieldValueType"] = typeof target[key];
    if (fieldValueType !== "function") {
      options.onNonFunction({ fieldKey: String(key), fieldValueType });
      return target[key] as NonFunctionFieldValue;
    }

    return (...functionArgs: FunctionCallbackPayload["functionArgs"]) => {
      try {
        const syncResult: unknown | Promise<unknown> | (unknown & { [key: string]: () => Promise<unknown> }) = (
          target[key] as ExecutionFunction
        )(...functionArgs);
        const callbackEnding = options.callbackEnding;
        if (
          callbackEnding !== undefined &&
          fieldValueType === "function" &&
          syncResult instanceof Object &&
          typeof syncResult[callbackEnding] === "function"
        ) {
          return {
            ...syncResult,
            [callbackEnding]: async (...functionArgs2: FunctionCallbackPayload["functionArgs"]) => {
              try {
                const asyncResult = await syncResult[callbackEnding](...functionArgs2);
                options.onSuccess({
                  functionArgs,
                  processingResult: ProcessingResult.succeed,
                  functionResult: asyncResult,
                  fieldValueType,
                  fieldKey: String(key),
                  processingStrategy: ProcessingType.callbackEnding,
                });
                return asyncResult;
              } catch (error) {
                error = (options.onError({
                  functionArgs,
                  processingResult: ProcessingResult.failed,
                  functionError: error,
                  fieldValueType,
                  fieldKey: String(key),
                  processingStrategy: ProcessingType.callbackEnding,
                }) || error) as OnErrorPayload["functionError"];
                throw error;
              }
            },
          };
        }
        if (syncResult instanceof Promise) {
          return (async () => {
            try {
              const asyncResult = await syncResult;
              options.onSuccess({
                functionArgs,
                processingResult: ProcessingResult.succeed,
                functionResult: asyncResult,
                fieldValueType,
                fieldKey: String(key),
                processingStrategy: ProcessingType.promise,
              });
              return asyncResult;
            } catch (error) {
              error = (options.onError({
                functionArgs,
                processingResult: ProcessingResult.failed,
                functionError: error,
                fieldValueType,
                fieldKey: String(key),
                processingStrategy: ProcessingType.promise,
              }) || error) as OnErrorPayload["functionError"];
              throw error;
            }
          })();
        }
        options.onSuccess({
          functionArgs,
          processingResult: ProcessingResult.succeed,
          functionResult: syncResult,
          fieldValueType,
          fieldKey: String(key),
          processingStrategy: ProcessingType.synchronous,
        });
        return syncResult;
      } catch (error) {
        error = (options.onError({
          functionArgs,
          processingResult: ProcessingResult.failed,
          functionError: error,
          fieldValueType,
          fieldKey: String(key),
          processingStrategy: ProcessingType.synchronous,
        }) || error) as OnErrorPayload["functionError"];
        throw error;
      }
    };
  },
});
