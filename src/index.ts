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
  fieldValue: any;
}
export interface OnBeforeCallbackPayload {
  functionArgs: unknown[];
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
export type OnBeforePayload = CallbackPayload & OnBeforeCallbackPayload;

export type OnErrorResult = OnErrorAdditionalPayload["functionError"] | void;
export type OnSuccessResult = OnSuccessPayload["functionResult"] | void;
export type OnNonFunctionResult = CallbackPayload["fieldValue"] | void;
export type OnBeforeResult = void;

export type OnError = (payload: OnErrorPayload) => OnErrorResult;
export type OnSuccess = (payload: OnSuccessPayload) => OnSuccessResult;
export type OnNonFunction = (payload: OnNonFunctionPayload) => OnNonFunctionResult;
export type OnBefore = (payload: OnBeforePayload) => OnBeforeResult;

export type InterceptorOptions = {
  onError: OnError;
  onSuccess: OnSuccess;
  onBefore: OnBefore;
  onNonFunction: OnNonFunction;
  /**
   * @description
   *`callbackEnding` field is used when an object (on which proxy with returned handler is applied) function use callback style to return value and have callback to promise transformation function. This field define a name of a callback to promise transformation function which should be executed after primary function execution.
   * @example
   * ```
   * import { StepFunctions } from "aws-sdk";
   * import { interceptor } from "generic-interceptor";
   *
   * const callbackEnding = "callbackToPromiseFunctionName";
   * const stepFunctions = new StepFunctions();
   * const wrappedStepFunctions = new Proxy(
   *   stepFunctions,
   *   interceptor({
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

export type Interceptor = (options: InterceptorOptions) => ProxyHandler<any>;

export const interceptor: Interceptor = (options) => ({
  get: (target, key) => {
    const fieldValueType: CallbackPayload["fieldValueType"] = typeof target[key];
    const commonCallbackPayload: CallbackPayload = { fieldKey: String(key), fieldValueType, fieldValue: target[key] };
    if (fieldValueType !== "function") {
      options.onNonFunction(commonCallbackPayload);
      return target[key] as NonFunctionFieldValue;
    }

    return (...functionArgs: FunctionCallbackPayload["functionArgs"]) => {
      try {
        options.onBefore({ ...commonCallbackPayload, functionArgs });
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
                return (options.onSuccess({
                  ...commonCallbackPayload,
                  functionArgs,
                  processingResult: ProcessingResult.succeed,
                  functionResult: asyncResult,
                  processingStrategy: ProcessingType.callbackEnding,
                }) || asyncResult) as OnSuccessPayload["functionResult"];
              } catch (error) {
                throw (options.onError({
                  ...commonCallbackPayload,
                  functionArgs,
                  processingResult: ProcessingResult.failed,
                  functionError: error,
                  processingStrategy: ProcessingType.callbackEnding,
                }) || error) as OnErrorPayload["functionError"];
              }
            },
          };
        }
        if (syncResult instanceof Promise) {
          return (async () => {
            try {
              const asyncResult = await syncResult;
              return (options.onSuccess({
                ...commonCallbackPayload,
                functionArgs,
                processingResult: ProcessingResult.succeed,
                functionResult: asyncResult,
                processingStrategy: ProcessingType.promise,
              }) || asyncResult) as OnSuccessPayload["functionResult"];
            } catch (error) {
              throw (options.onError({
                ...commonCallbackPayload,
                functionArgs,
                processingResult: ProcessingResult.failed,
                functionError: error,
                processingStrategy: ProcessingType.promise,
              }) || error) as OnErrorPayload["functionError"];
            }
          })();
        }
        return (options.onSuccess({
          ...commonCallbackPayload,
          functionArgs,
          processingResult: ProcessingResult.succeed,
          functionResult: syncResult,
          processingStrategy: ProcessingType.synchronous,
        }) || syncResult) as OnSuccessPayload["functionResult"];
      } catch (error) {
        throw (options.onError({
          ...commonCallbackPayload,
          functionArgs,
          processingResult: ProcessingResult.failed,
          functionError: error,
          processingStrategy: ProcessingType.synchronous,
        }) || error) as OnErrorPayload["functionError"];
      }
    };
  },
});
