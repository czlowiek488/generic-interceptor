export type CallbackFieldValueType = string;
export type CallbackFieldKey = string;
export type FunctionCallbackArg = unknown;
export type OnSuccessPayloadResult = any;
export type CallbackEnding = string;
export enum ProcessingType {
  sync = "SYNC",
  async = "ASYNC",
}
export interface CallbackPayload {
  fieldValueType: CallbackFieldValueType;
  fieldKey: CallbackFieldKey;
}
export interface FunctionCallbackPayload {
  processingType: ProcessingType;
  args: FunctionCallbackArg[];
}
export interface OnErrorAdditionalPayload {
  error: Error;
}
export interface OnSuccessAdditionalPayload {
  result: OnSuccessPayloadResult;
}
export type OnErrorPayload = CallbackPayload & FunctionCallbackPayload & OnErrorAdditionalPayload;
export type OnSuccessPayload = CallbackPayload & FunctionCallbackPayload & OnSuccessAdditionalPayload;
export type OnNonFunctionPayload = CallbackPayload;
export type OnError = (payload: OnErrorPayload) => Error | void;
export type OnSuccess = (payload: OnSuccessPayload) => void;
export type OnNonFunction = (payload: OnNonFunctionPayload) => void;
export interface ProxyHandlerGenericExecutionOptions {
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
}
export type ProxyHandlerGenericExecution = (options: ProxyHandlerGenericExecutionOptions) => ProxyHandler<any>;

export const proxyHandlerGenericExecution: ProxyHandlerGenericExecution = (options) => ({
  get: (target, key) => {
    const fieldValueType = typeof target[key];
    if (fieldValueType !== "function") {
      options.onNonFunction({ fieldKey: String(key), fieldValueType });
      return target[key];
    }
    return (...args: FunctionCallbackPayload["args"]) => {
      try {
        const syncResult = target[key](...args);
        const callbackEnding = options.callbackEnding;
        if (
          callbackEnding !== undefined &&
          typeof syncResult[callbackEnding] === "function" &&
          fieldValueType === "function"
        ) {
          return {
            ...syncResult,
            [callbackEnding]: async (...args2: FunctionCallbackPayload["args"]) => {
              try {
                const asyncResult = await syncResult[callbackEnding](...args2);
                options.onSuccess({
                  args,
                  result: asyncResult,
                  fieldValueType,
                  fieldKey: String(key),
                  processingType: ProcessingType.async,
                });
                return asyncResult;
              } catch (error) {
                error =
                  options.onError({
                    args,
                    error,
                    fieldValueType,
                    fieldKey: String(key),
                    processingType: ProcessingType.async,
                  }) || error;
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
                args,
                result: asyncResult,
                fieldValueType,
                fieldKey: String(key),
                processingType: ProcessingType.async,
              });
              return asyncResult;
            } catch (error) {
              error =
                options.onError({
                  args,
                  error,
                  fieldValueType,
                  fieldKey: String(key),
                  processingType: ProcessingType.async,
                }) || error;
              throw error;
            }
          })();
        }
        options.onSuccess({
          args,
          result: syncResult,
          fieldValueType,
          fieldKey: String(key),
          processingType: ProcessingType.sync,
        });
        return syncResult;
      } catch (error) {
        error =
          options.onError({
            args,
            error,
            fieldValueType,
            fieldKey: String(key),
            processingType: ProcessingType.sync,
          }) || error;
        throw error;
      }
    };
  },
});
