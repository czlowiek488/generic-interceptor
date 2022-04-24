export type CallbackFieldValueType = string;
export type CallbackFieldKey = string;
export type FunctionCallbackArg = unknown;
export type OnSuccessPayloadResult = any;
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
  fieldValueType: CallbackFieldValueType;
  fieldKey: CallbackFieldKey;
}
export interface FunctionCallbackPayload {
  processingStrategy: ProcessingType;
  functionArgs: FunctionCallbackArg[];
}
export interface OnErrorAdditionalPayload {
  processingResult: ProcessingResult.failed;
  functionError: Error;
}
export interface OnSuccessAdditionalPayload {
  processingResult: ProcessingResult.succeed;
  functionResult: OnSuccessPayloadResult;
}
export type OnErrorPayload = CallbackPayload & FunctionCallbackPayload & OnErrorAdditionalPayload;
export type OnSuccessPayload = CallbackPayload & FunctionCallbackPayload & OnSuccessAdditionalPayload;
export type OnNonFunctionPayload = CallbackPayload;
export type OnError = (payload: OnErrorPayload) => Error | void;
export type OnSuccess = (payload: OnSuccessPayload) => void;
export type OnNonFunction = (payload: OnNonFunctionPayload) => void;

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

export type ProxyHandlerGenericExecutionOptions<CallbackEnding = string | undefined> = {
  onError: OnError;
  onSuccess: OnSuccess;
  onNonFunction: OnNonFunction;
} & (CallbackEnding extends undefined ? { callbackEnding: string } : any);

export type ProxyHandlerGenericExecution = (options: ProxyHandlerGenericExecutionOptions) => ProxyHandler<any>;

export const proxyHandlerGenericExecution: ProxyHandlerGenericExecution = (options) => ({
  get: (target, key) => {
    const fieldValueType = typeof target[key];
    if (fieldValueType !== "function") {
      options.onNonFunction({ fieldKey: String(key), fieldValueType });
      return target[key];
    }
    return (...functionArgs: FunctionCallbackPayload["functionArgs"]) => {
      try {
        const syncResult = target[key](...functionArgs);
        const callbackEnding = options.callbackEnding;
        if (
          callbackEnding !== undefined &&
          typeof syncResult[callbackEnding] === "function" &&
          fieldValueType === "function"
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
                error =
                  options.onError({
                    functionArgs,
                    processingResult: ProcessingResult.failed,
                    functionError: error,
                    fieldValueType,
                    fieldKey: String(key),
                    processingStrategy: ProcessingType.callbackEnding,
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
                functionArgs,
                processingResult: ProcessingResult.succeed,
                functionResult: asyncResult,
                fieldValueType,
                fieldKey: String(key),
                processingStrategy: ProcessingType.promise,
              });
              return asyncResult;
            } catch (error) {
              error =
                options.onError({
                  functionArgs,
                  processingResult: ProcessingResult.failed,
                  functionError: error,
                  fieldValueType,
                  fieldKey: String(key),
                  processingStrategy: ProcessingType.promise,
                }) || error;
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
        error =
          options.onError({
            functionArgs,
            processingResult: ProcessingResult.failed,
            functionError: error,
            fieldValueType,
            fieldKey: String(key),
            processingStrategy: ProcessingType.synchronous,
          }) || error;
        throw error;
      }
    };
  },
});
