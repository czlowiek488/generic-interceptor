# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2022-04-25

- changed
  - [README.md](README.md) lodash added
  - typos fixed

## [1.4.0] - 2022-04-25

- changed
  - `CallbackFieldValueType` -> `CallbackPayload.fieldValueType`
  - `CallbackFieldKey` -> `CallbackPayload.fieldKey`
  - `FunctionCallbackArg` -> `FunctionCallbackPayload.functionArgs`
  - `OnSuccessPayloadResult` -> `OnSuccessAdditionalPayload.functionResult`
  - `ProxyHandlerGenericExecutionOptions.callbackEnding` -> `CallbackEnding`
- added
  - `ExecutionFunction` -> Function
  - `NonFunctionFieldValue` -> unknown
  - `OnErrorResult` -> `OnErrorAdditionalPayload.functionError` | void
  - `OnSuccessResult` -> void
  - `OnNonFunctionResult` -> void
  
## [1.3.0] - 2022-04-25

- changed
  - `ProxyHandlerGenericExecutionOptions.callbackStatus` is now generic
- added
  - `ProcessingStrategy.callbackEnding` -> "callback ending"
  
## [1.2.0] - 2022-04-24

- added
  - `OnErrorAdditionalPayload.processingResult` -> `ProcessingResult.fail`
  - `OnSuccessAdditionalPayload.processingResult` -> `ProcessingResult.succeed`

## [1.1.0] - 2022-04-24

- changed
  - `ProxyHandlerGenericExecutionOptions.processingType` -> `ProxyHandlerGenericExecutionOptions.processingStrategy`
  - `ProxyHandlerGenericExecutionOptions.result` -> `ProxyHandlerGenericExecutionOptions.functionResult`
  - `ProxyHandlerGenericExecutionOptions.error` -> `ProxyHandlerGenericExecutionOptions.functionError`
  - `ProcessingType` -> `ProcessingStrategy`
  - `ProcessingStrategy.sync` -> "synchronous"
  - `ProcessingStrategy.promise` -> "promise async"

## [1.0.1] - 2022-04-23

- changed
  - [README.md](README.md) formatting

## [1.0.0] - 2022-04-23
