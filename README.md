<h1> Proxy Handler Generic Execution </h1>
This package provide generic proxy object handler which allows to execute provided function whenever no function variable is touched and also in between function execution and return/resolve/throw.

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
 

## Technology Stack

* [`Typescript`](https://www.npmjs.com/package/typescript)
* [`Jest`](https://www.npmjs.com/package/jest)
* [`Eslint`](https://www.npmjs.com/package/eslint)
* [`Commitlint`](https://www.npmjs.com/package/@commitlint/config-conventional)
* [`Husky`](https://www.npmjs.com/package/husky)
* [`Prettier`](https://www.npmjs.com/package/prettier)

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
    processingType: "SYNC" | "ASYNC";
    args: unknown[];
    result: any;
```
* `onError`
```ts
    fieldValueType: string;
    fieldKey: string;
    processingType: "SYNC" | "ASYNC";
    args: unknown[];
    error: Error;
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
 * Console: 
 * 
 * { 
 *  fieldValueType: 'function', <- userRepository.find field value is function
 *  fieldKey: 'find', <- userRepository touched field key
 *  processingType: 'SYNC', <- userRepository.find returns no promise object
 *  args: [ { id: 1 } ], <- userRepository.find execution arguments
 *  result: { id: 1, name: 'John' } <- userRepository.find execution result
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
 * Console: 
 * 
 * { 
 *  fieldValueType: 'function', <- userRepository.find field value is function
 *  fieldKey: 'find', <- userRepository touched field key
 *  processingType: 'ASYNC', <- userRepository.find returns promise object
 *  args: [], <- userRepository.find execution arguments
 *  error: Error { message: 'error message' } <- userRepository.find error object
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
 * Console: 
 * 
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
 * Console: 
 * 
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

* Suggestions about tests, implementation or other are welcome
* Pull request are more than welcome
### How to start

1. Clone project into your computer 
   
   
   `git clone https://github.com/czlowiek488/proxy-handler-generic-execution.git`
2. Install dev dependencies

    `npm i`
3. Run all tests 
    
    `npm run test`
4. To run specific tests run one of those commands
   - `npm run test-promise`
   - `npm run test-callback`
   - `npm run test-sync`
   - `npm run test-error`
   - `npm run test-success`
   - `npm run test-common`
   - `npm run test-pattern --pattern='no-function'`
  
### Information

- *[Test patterns are stored in typescript enums](tests/shared/names.ts)*
- *[Test patterns will never overlap with each other](tests/shared/test-consistency.ts)*
- *[Test patterns must be used in it/describe block names](tests/shared/overrides.ts)*
- *[Each test case must be executed with common tests and separated test coverage](tests/runner/per-case.ts)*
- Husky is hooked for
  - commit - commitlint + eslint
  - push - eslint + build + test
- On prepublish - eslint + build + test