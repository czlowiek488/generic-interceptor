# Changelog
All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- added
  - `ProcessingStrategy.callbackEnding` -> "callback ending"

## [1.0.1] - 2022-04-24
- changed
  - [README.md](README.md) formatting
## [1.0.0] - 2022-04-24
