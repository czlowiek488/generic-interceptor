import { v4 } from "uuid";

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
export interface CallbackPayload<TPassFunctionId extends boolean> {
  fieldValueType: string;
  fieldKey: string;
  fieldValue: any;
  id: TPassFunctionId extends true ? string : undefined;
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
export type OnErrorPayload<TPassFunctionId extends boolean> = CallbackPayload<TPassFunctionId> &
  FunctionCallbackPayload &
  OnErrorAdditionalPayload;
export type OnSuccessPayload<TPassFunctionId extends boolean> = CallbackPayload<TPassFunctionId> &
  FunctionCallbackPayload &
  OnSuccessAdditionalPayload;
export type OnNonFunctionPayload = CallbackPayload<boolean>;
export type OnBeforePayload<TPassFunctionId extends boolean> = CallbackPayload<TPassFunctionId> &
  OnBeforeCallbackPayload;

export type OnErrorResult = OnErrorAdditionalPayload["functionError"] | void;
export type OnSuccessResult = OnSuccessPayload<boolean>["functionResult"] | void;
export type OnNonFunctionResult = CallbackPayload<boolean>["fieldValue"] | void;
export type OnBeforeResult = ExecutionFunction | void;

export type OnError<TPassFunctionId extends boolean> = (payload: OnErrorPayload<TPassFunctionId>) => OnErrorResult;
export type OnSuccess<TPassFunctionId extends boolean> = (
  payload: OnSuccessPayload<TPassFunctionId>,
) => OnSuccessResult;
export type OnNonFunction = (payload: OnNonFunctionPayload) => OnNonFunctionResult;
export type OnBefore<TPassFunctionId extends boolean> = (payload: OnBeforePayload<TPassFunctionId>) => OnBeforeResult;

export type InterceptorOptions<TPassFunctionId extends boolean> = {
  passId: TPassFunctionId;
  onError: OnError<TPassFunctionId>;
  onSuccess: OnSuccess<TPassFunctionId>;
  onBefore: OnBefore<TPassFunctionId>;
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

export const interceptor = <TPassFunctionId extends boolean>(
  options: InterceptorOptions<TPassFunctionId>,
): ProxyHandler<any> => ({
  get: (target, key) => {
    const fieldValueType: CallbackPayload<TPassFunctionId>["fieldValueType"] = typeof target[key];
    const commonCallbackPayload: CallbackPayload<TPassFunctionId> = {
      fieldKey: String(key),
      fieldValueType,
      fieldValue: target[key],
      id: options.passId === true ? v4() : undefined,
    };
    if (fieldValueType !== "function") {
      options.onNonFunction(commonCallbackPayload);
      return target[key] as NonFunctionFieldValue;
    }

    return (...functionArgs: FunctionCallbackPayload["functionArgs"]) => {
      try {
        const maybeNewFunc = options.onBefore({ ...commonCallbackPayload, functionArgs });
        const syncResult: unknown | Promise<unknown> | (unknown & { [key: string]: () => Promise<unknown> }) =
          maybeNewFunc === undefined
            ? (target[key] as ExecutionFunction)(...functionArgs)
            : maybeNewFunc(...functionArgs);
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
                }) || asyncResult) as OnSuccessPayload<TPassFunctionId>["functionResult"];
              } catch (error) {
                throw (options.onError({
                  ...commonCallbackPayload,
                  functionArgs,
                  processingResult: ProcessingResult.failed,
                  functionError: error,
                  processingStrategy: ProcessingType.callbackEnding,
                }) || error) as OnErrorPayload<TPassFunctionId>["functionError"];
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
              }) || asyncResult) as OnSuccessPayload<TPassFunctionId>["functionResult"];
            } catch (error) {
              throw (options.onError({
                ...commonCallbackPayload,
                functionArgs,
                processingResult: ProcessingResult.failed,
                functionError: error,
                processingStrategy: ProcessingType.promise,
              }) || error) as OnErrorPayload<TPassFunctionId>["functionError"];
            }
          })();
        }
        return (options.onSuccess({
          ...commonCallbackPayload,
          functionArgs,
          processingResult: ProcessingResult.succeed,
          functionResult: syncResult,
          processingStrategy: ProcessingType.synchronous,
        }) || syncResult) as OnSuccessPayload<TPassFunctionId>["functionResult"];
      } catch (error) {
        throw (options.onError({
          ...commonCallbackPayload,
          functionArgs,
          processingResult: ProcessingResult.failed,
          functionError: error,
          processingStrategy: ProcessingType.synchronous,
        }) || error) as OnErrorPayload<TPassFunctionId>["functionError"];
      }
    };
  },
});
