export type CallbackDataType = string;
export type CallbackDataKey = string;
export interface CallbackData {
  type: CallbackDataType;
  key: CallbackDataKey;
}
export enum Tag {
    sync = 'SYNC',
    async = 'ASYNC',
}
export type FunctionCallbackDataArg = unknown;
export interface FunctionCallbackData {
  tag: Tag;
  args: FunctionCallbackDataArg[];
}
export type onErrorData = CallbackData & FunctionCallbackData & { error: Error };
export type onSuccessDataResult = any;
export type onSuccessData = CallbackData & FunctionCallbackData & { result: onSuccessDataResult };
export type onNonFunctionData = CallbackData;
export type onError = (data: onErrorData) => Error | void;
export type onSuccess = (data: onSuccessData) => void;
export type onNonFunction = (data: onNonFunctionData) => void;
export type promiseEnding = string;
export interface ProxyHandlerGenericExecutionOptions {
  onError: onError;
  onSuccess: onSuccess;
  onNonFunction: onNonFunction;
  promiseEnding?: promiseEnding;

 }
export type ProxyHandlerGenericExecution = (options: ProxyHandlerGenericExecutionOptions) => ProxyHandler<any>;

 export const executionGenericProxyHandler: ProxyHandlerGenericExecution = (options) => ({
  get: (target, key) => {
    const type = typeof target[key];
    if (type !== "function") {
      options.onNonFunction({ key: String(key), type });
      return target[key];
    }
    return (...args: FunctionCallbackData['args']) => {
      try {
        const syncResult = target[key](...args);
        const promiseEnding = options.promiseEnding;
        if (promiseEnding !== undefined && typeof syncResult[promiseEnding] === "function" && type === "function") {
          return {
            ...syncResult,
            [promiseEnding]: async (...args2: FunctionCallbackData['args']) => {
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
