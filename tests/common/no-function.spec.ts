import { OnNonFunctionPayload, proxyHandlerGenericExecution } from "../../src/index";
import { commonDescribe } from "../shared/overrides";

const testingParameterName = "testingParameterName";

commonDescribe("<common> <no-function>", () => {
  it("get", () => {
    const dataset = {
      value: "VALUE",
      options: {
        onSuccess: () => {},
        onNonFunction: jest.fn(),
        onError: () => {},
      },
      args: [1, 2, 3],
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
