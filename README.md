<h1> Proxy Handler Generic Execution </h1>
This package provide generic proxy object handler which allows to execute provided function whenever no function common variable is touched and also in between function execution and return/resolve/throw.

</br>

<h2> Table of Contents </h2>

- [Technology Stack](#technology-stack)
- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
  - [Argument properties](#argument-properties)
  - [Callback payloads](#callback-payloads)
  - [Callback results](#callback-results)
- [Examples](#examples)
  - [Logging function execution result](#logging-function-execution-result)
  - [Logging function execution error](#logging-function-execution-error)
  - [Logging object touched properties](#logging-object-touched-properties)
  - [Modifying function execution error](#modifying-function-execution-error)
  - [Generic logger for object of repositories](#generic-logger-for-object-of-repositories)
  - [Multiple proxies applied](#multiple-proxies-applied)
  - [Handling callback to promise transformation](#handling-callback-to-promise-transformation)
- [Changelog](#changelog)
- [Contribute](#contribute)
  - [How to start](#how-to-start)
  - [Information](#information)
  - [Adding new test](#adding-new-test)
    - [3 parts of test](#3-parts-of-test)
    - [Writing tests](#writing-tests)
 

## Technology Stack

* [`Typescript`](https://www.npmjs.com/package/typescript)
* [`Jest`](https://www.npmjs.com/package/jest)
* [`Eslint`](https://www.npmjs.com/package/eslint)
* [`Commitlint`](https://www.npmjs.com/package/@commitlint/config-conventional)
* [`Husky`](https://www.npmjs.com/package/husky)
* [`Prettier`](https://www.npmjs.com/package/prettier)
* [`Lodash`](https://www.npmjs.com/package/lodash)

## Dependencies

    0 dependency package!


## Installation

`npm i -s proxy-handler-generic-execution`

## Usage

### Argument properties

* `onSuccess` - function triggered whenever proxied object function result is returned.

* `onError` - function triggered whenever proxied object function throws an error.

* `onNonFunction` - function triggered whenever proxied object non functional property is touched (object property getter is triggered).

* `callbackEnding` - string used whenever proxied object function use callback style to return value and have callback to promise transformation function. This field define a name of a callback to promise transformation function which should be executed after primary function execution. [Example](#handling-callback-to-promise-transformation)
  
### Callback payloads

* `onSuccess`
```ts
    fieldValueType: string;
    fieldKey: string;
    processingStrategy: "synchronous" | "promise async" | "callback ending";
    functionArgs: unknown[];
    functionResult: any;
    processingResult: "succeed"
```
* `onError`
```ts
    fieldValueType: string;
    fieldKey: string;
    processingStrategy: "synchronous" | "promise async" | "callback ending";
    functionArgs: unknown[];
    functionError: Error;
    processingResult: "failed"
```
* `onNonFunction`
```ts
    fieldValueType: string;
    fieldKey: string;
```

### Callback results

* `onSuccess`
```ts
    void;
```
* `onError`
```ts
    Error | void;
```
* `onNonFunction`
```ts
    void;
```

## Examples

### Logging function execution result

```ts
import { proxyHandlerGenericExecution } from "proxy-handler-generic-execution";
const userRepository = {
  find: ({ id }) => ({ id, name: "John" }),
};
const wrappedUserRepository = new Proxy(
  userRepository,
  proxyHandlerGenericExecution({
    onSuccess: console.log,
    onNonFunction: () => {},
    onError: () => {},
  }),
);

wrappedUserRepository.find({ id: 1 });
/**
 * { 
 *  fieldValueType: 'function', <- userRepository.find field value is function
 *  fieldKey: 'find', <- userRepository touched field key
 *  processingStrategy: 'synchronous', <- userRepository.find returns no promise object
 *  functionArgs: [ { id: 1 } ], <- userRepository.find execution arguments
 *  functionResult: { id: 1, name: 'John' }, <- userRepository.find execution result
 *  processingResult: 'succeed' <- userRepository.find did not throw during execution
 * }
 **/
```

### Logging function execution error

```ts
import { proxyHandlerGenericExecution } from "proxy-handler-generic-execution";
const userRepository = {
  find: async () => {
    throw Error("error message");
  },
};
const wrappedUserRepository = new Proxy(
  userRepository,
  proxyHandlerGenericExecution({
    onSuccess: () => {},
    onNonFunction: () => {},
    onError: console.log,
  }),
);

wrappedUserRepository.find();
/**
 * { 
 *  fieldValueType: 'function', <- userRepository.find field value is function
 *  fieldKey: 'find', <- userRepository touched field key
 *  processingStrategy: 'promise async', <- userRepository.find returns promise object
 *  functionArgs: [], <- userRepository.find execution arguments
 *  functionError: Error { message: 'error message' }, <- userRepository.find error object
 *  processingResult: 'failed' <- userRepository.find did not throw during execution
 * }
 * (node:11867) UnhandledPromiseRejectionWarning: Error: error message
 *  at .../index.ts:112:11
 *  at Generator.next (<anonymous>)
 *  at .../index.ts:8:71
 *  at new Promise (<anonymous>)
 *  at __awaiter (.../index.ts:4:12)
 *  at Object.find (.../index.ts:111:20)
 *  at Proxy.<anonymous> (.../index.ts:72:39)
 *  at Object.<anonymous> (.../index.ts:124:23)
 *  at Module._compile (.../loader.js:999:30)
 *  at Module.m._compile (.../index.ts:1455:23)
 * (node:11867) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 2)
 * (node:11867) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
 **/
```

### Logging object touched properties

```ts
import { proxyHandlerGenericExecution } from "proxy-handler-generic-execution";
const userRepository = {
  repositoryName: "user",
};
const wrappedUserRepository = new Proxy(
  userRepository,
  proxyHandlerGenericExecution({
    onSuccess: () => {},
    onNonFunction: console.log,
    onError: () => {},
  }),
);

wrappedUserRepository.repositoryName;
/**
 * { 
 *  fieldValueType: 'string', <- userRepository.get field value is function
 *  fieldKey: 'repositoryName', <- userRepository touched field key
 * }
 **/
```

### Modifying function execution error 

```ts
import { proxyHandlerGenericExecution } from "proxy-handler-generic-execution";
const userRepository = {
  find: async () => {
    throw Error("error message");
  },
};
const wrappedUserRepository = new Proxy(
  userRepository,
  proxyHandlerGenericExecution({
    onSuccess: () => {},
    onNonFunction: () => {},
    onError: ({ error, key }) => {
      error.message = `userRepository.${key} > ${error.message}`;
      return error;
    },
  }),
);

wrappedUserRepository.find();
/**
 * (node:11867) UnhandledPromiseRejectionWarning: Error: userRepository.find > error message
 *  at .../index.ts:112:11
 *  at Generator.next (<anonymous>)
 *  at .../index.ts:8:71
 *  at new Promise (<anonymous>)
 *  at __awaiter (.../index.ts:4:12)
 *  at Object.find (.../index.ts:111:20)
 *  at Proxy.<anonymous> (.../index.ts:72:39)
 *  at Object.<anonymous> (.../index.ts:124:23)
 *  at Module._compile (.../loader.js:999:30)
 *  at Module.m._compile (.../index.ts:1455:23)
 * (node:11867) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 2)
 * (node:11867) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
 **/
```

### Generic logger for object of repositories

```ts
import { proxyHandlerGenericExecution } from "proxy-handler-generic-execution";
const proxyHandlerLogger = proxyHandlerGenericExecution({
  onSuccess: console.log,
  onNonFunction: console.log,
  onError: console.log,
});
const repositories = {
  user: {
    find: ({ id }) => ({ id, name: "John" }),
  },
  order: {
    create: ({ value }) => ({ id: 2, value }),
  },
};
const proxiedRepositories = Object.fromEntries(
  Object.entries(repositories).map(([repositoryName, repository]) => [
    repositoryName,
    new Proxy(repository, proxyHandlerLogger),
  ]),
);
```

### Multiple proxies applied

```ts
import { proxyHandlerGenericExecution } from "proxy-handler-generic-execution";
const proxyHandlerErrorDecorator = proxyHandlerGenericExecution({
  onSuccess: () => {},
  onNonFunction: () => {},
  onError: ({ error, key }) => {
    error.message = `userRepository.${key} > ${error.message}`;
    return error;
  },
});
const proxyHandlerLogger = proxyHandlerGenericExecution({
  onSuccess: console.log,
  onNonFunction: console.log,
  onError: console.log,
});
const userRepository = {
  find: ({ id }) => ({ id, name: "John" }),
};
const proxiedUserRepository = [proxyHandlerErrorDecorator, proxyHandlerLogger].reduce((acc, handler) => new Proxy(acc, handler), userRepository);
```

### Handling callback to promise transformation

```ts
import { StepFunctions } from "aws-sdk";
import { proxyHandlerGenericExecution } from "proxy-handler-generic-execution";

const callbackEnding = "promise";
const stepFunctions = new StepFunctions();
const wrappedStepFunctions = new Proxy(
  stepFunctions,
  proxyHandlerGenericExecution({
    callbackEnding,
    onSuccess: () => {},
    onNonFunction: () => {},
    onError: () => {},
  }),
);

(async () => {
  await wrappedStepFunctions.startExecution({ stateMachineArn: "ARN" })[callbackEnding]();
})();
```

## Changelog

 [Changelog](changelog.md)

## Contribute

* Suggestions about tests, implementation or others are welcome
* Pull requests are more than welcome
### How to start

1. Clone project

    `git clone https://github.com/czlowiek488/proxy-handler-generic-execution.git`

2. Install dependencies

    `npm install`

3. Run all tests 
    
    `npm run test`
4. To run specific test run one of those commands
   - `npm run test-promise`
   - `npm run test-callback`
   - `npm run test-sync`
   - `npm run test-error`
   - `npm run test-success`
   - `npm run test-common`
   - `npm run test-pattern --pattern='no-function'`
  
### Information

- [Test patterns are stored in typescript enums](tests/shared/enum.ts)
- [Test patterns will never overlap with each other](tests/setup.ts)
- [Test patterns must be used in it/describe block names](tests/shared/jest.ts)
- [Each test case must be executed with common tests and separated test coverage](tests/shared/run-per-case.ts)
- Husky is hooked for
  - [commit-msg](.husky/commit-msg)
  - [pre-push](.husky/pre-push)
- [prepublish & prepare](package.json)

### Adding new test
#### 3 parts of test
   -  [common](tests/common/) - running along with each case
   -  [case](tests/case/)
      -  case (describe) - the way strategies are used, sequence per case. Each sequence has own coverage report. New case must not change proxy handler implementation.
      -  strategy (it) - may be used in multiple not known ways, each way is a case. Each strategy is contained by each of all cases. New strategy may change proxy handler implementation.
  
#### Writing tests
  - `Case Test`
    1. Add case test name to [TestCaseDescribe](/tests/shared/enum.ts) enum
    2. Add proper file to [test case](tests/case/) directory. Must include all strategy tests.
    3. Typescript will show errors in places where your test is not implemented
    4. Implement your tests using already existing ones as reference
    5. Execute tests
  - `Strategy Test`
    1. Modify [proxy handler implementation](/src/index.ts)
    2. Add test name to [TestStrategyIt](tests/shared/enum.ts) enum
    3. Execute tests, coverage will be less than 100%
  - `Common test`
    1. Add common test name to [TestCommonDescribe](tests/shared/enum.ts) enum
    2. Add test to [common test](tests/common/) directory
    3. Execute tests
   

  

