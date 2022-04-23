export type CallbackDataType = string;
export type CallbackDataKey = string;
export type FunctionCallbackDataArg = unknown;
export type OnSuccessDataResult = any;
export type PromiseEnding = string;
export enum Tag {
  sync = "SYNC",
  async = "ASYNC",
}
export interface CallbackData {
  type: CallbackDataType;
  key: CallbackDataKey;
}
export interface FunctionCallbackData {
  tag: Tag;
  args: FunctionCallbackDataArg[];
}
export interface OnErrorAdditionalData {
  error: Error;
}
export interface OnSuccessAdditionalData {
  result: OnSuccessDataResult;
}
export type OnErrorData = CallbackData & FunctionCallbackData & OnErrorAdditionalData;
export type OnSuccessData = CallbackData & FunctionCallbackData & OnSuccessAdditionalData;
export type OnNonFunctionData = CallbackData;
export type OnError = (data: OnErrorData) => Error | void;
export type OnSuccess = (data: OnSuccessData) => void;
export type OnNonFunction = (data: OnNonFunctionData) => void;
export interface ProxyHandlerGenericExecutionOptions {
  onError: OnError;
  onSuccess: OnSuccess;
  onNonFunction: OnNonFunction;
  /**
   * @description
   *`promiseEnding` field is used when an object (on which this proxy handler is applied) function use callback style to return value. It should be a name of a function in result which transforms async processing from callback style to promise style.
   * @example
   * ```
   * import { StepFunctions } from "aws-sdk";
   * import { proxyHandlerGenericExecution } from "proxy-handler-generic-execution";
   *
   * const promiseEnding = "promise";
   * const stepFunctions = new StepFunctions();
   * const wrappedStepFunctions = new Proxy(
   *   stepFunctions,
   *   proxyHandlerGenericExecution({
   *     promiseEnding,
   *     onSuccess: () => {},
   *     onNonFunction: () => {},
   *     onError: () => {},
   *   }),
   * );
   *
   * (async () => {
   *   await wrappedStepFunctions.startExecution({ stateMachineArn: "ARN" })[promiseEnding]();
   * })();
   * ```
   */
  promiseEnding?: PromiseEnding;
}
export type ProxyHandlerGenericExecution = (options: ProxyHandlerGenericExecutionOptions) => ProxyHandler<any>;

export const proxyHandlerGenericExecution: ProxyHandlerGenericExecution = (options) => ({
  get: (target, key) => {
    const type = typeof target[key];
    if (type !== "function") {
      options.onNonFunction({ key: String(key), type });
      return target[key];
    }
    return (...args: FunctionCallbackData["args"]) => {
      try {
        const syncResult = target[key](...args);
        const promiseEnding = options.promiseEnding;
        if (promiseEnding !== undefined && typeof syncResult[promiseEnding] === "function" && type === "function") {
          return {
            ...syncResult,
            [promiseEnding]: async (...args2: FunctionCallbackData["args"]) => {
              try {
                const asyncResult = await syncResult[promiseEnding](...args2);
                options.onSuccess({ args, result: asyncResult, type, key: String(key), tag: Tag.async });
                return asyncResult;
              } catch (error) {
                error = options.onError({ args, error, type, key: String(key), tag: Tag.async }) || error;
                throw error;
              }
            },
          };
        }
        if (syncResult instanceof Promise) {
          return (async () => {
            try {
              const asyncResult = await syncResult;
              options.onSuccess({ args, result: asyncResult, type, key: String(key), tag: Tag.async });
              return asyncResult;
            } catch (error) {
              error = options.onError({ args, error, type, key: String(key), tag: Tag.async }) || error;
              throw error;
            }
          })();
        }
        options.onSuccess({ args, result: syncResult, type, key: String(key), tag: Tag.sync });
        return syncResult;
      } catch (error) {
        error = options.onError({ args, error, type, key: String(key), tag: Tag.sync }) || error;
        throw error;
      }
    };
  },
});
