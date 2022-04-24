import { OnNonFunctionPayload, proxyHandlerGenericExecution } from "../../src/index";
import { commonDescribe, commonIt } from "../shared/jest";

const testingParameterName = "testingParameterName";

commonDescribe("<common prefix> <no function case>", () => {
  commonIt("<common prefix> <get no functional property strategy>", () => {
    const dataset = {
      value: "VALUE",
      options: {
        onSuccess: () => {},
        onNonFunction: jest.fn(),
        onError: () => {},
      },
      functionArgs: [1, 2, 3],
    };
    const target = {
      [testingParameterName]: dataset.value,
    };
    const handler = proxyHandlerGenericExecution(dataset.options);

    const proxy = new Proxy(target, handler);

    expect(proxy[testingParameterName]).toEqual(dataset.value);
    expect(dataset.options.onNonFunction).toHaveBeenCalledTimes(1);
    expect(dataset.options.onNonFunction).toHaveBeenCalledWith({
      fieldKey: testingParameterName,
      fieldValueType: typeof proxy[testingParameterName],
    } as OnNonFunctionPayload);
  });
});
